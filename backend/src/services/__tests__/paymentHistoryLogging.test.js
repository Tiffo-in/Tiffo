const mongoose = require('mongoose');

const {
  verifySubscriptionPayment,
  confirmCod,
  processRefundForSubscription,
  fetchPaymentHistory,
} = require('../paymentService');

const Subscription = require('../../models/Subscription');
const PaymentLog = require('../../models/PaymentLog');
const { verifyPaymentSignature, createRefund } = require('../razorpayService');
const { generateDeliveriesForSubscription } = require('../deliveryService');

// PaymentLog is replaced by a tiny in-memory collection so a write made by one
// service function can be read back through fetchPaymentHistory — that round
// trip is the thing being regression-tested: every log the customer owns must
// carry `userId`, because the history endpoint queries by it.
jest.mock('../../models/PaymentLog', () => {
  const store = [];
  const populates = [];

  const matches = (doc, query) =>
    Object.entries(query).every(([key, value]) => String(doc[key]) === String(value));

  const makeQuery = (docs) => {
    let skip = 0;
    let limit = Infinity;
    const query = {
      sort: () => query,
      skip: (n) => {
        skip = n;
        return query;
      },
      limit: (n) => {
        limit = n;
        return query;
      },
      populate: (path, select) => {
        populates.push({ path, select });
        return query;
      },
      session: () => query,
      lean: () => Promise.resolve(docs.slice(skip, skip + limit)),
    };
    return query;
  };

  return {
    // Mirrors the schema's `required` fields so a write that omits one fails
    // here the same way it would against Mongo.
    create: jest.fn(async (docs) => {
      const list = Array.isArray(docs) ? docs : [docs];
      const created = list.map((doc) => {
        for (const field of ['type', 'status', 'amount']) {
          if (doc[field] === undefined || doc[field] === null) {
            throw new Error(`PaymentLog validation failed: ${field} is required`);
          }
        }
        const saved = { ...doc, _id: `log_${store.length + 1}`, createdAt: new Date() };
        store.push(saved);
        return saved;
      });
      return Array.isArray(docs) ? created : created[0];
    }),
    find: jest.fn((query = {}) => makeQuery(store.filter((doc) => matches(doc, query)))),
    countDocuments: jest.fn(
      async (query = {}) => store.filter((doc) => matches(doc, query)).length,
    ),
    findOneAndUpdate: jest.fn(() => makeQuery([])),
    __store: store,
    __populates: populates,
    __reset: () => {
      store.splice(0, store.length);
      populates.splice(0, populates.length);
    },
  };
});

jest.mock('../../models/Subscription');
jest.mock('../../models/User');
jest.mock('../../models/Partner');
jest.mock('../razorpayService');
jest.mock('../deliveryService');
jest.mock('../capacityService');
jest.mock('../socketService');

describe('PaymentLog ownership — writes surface in fetchPaymentHistory', () => {
  const userId = 'user_owner';
  const otherUserId = 'user_other';
  const partnerId = 'partner_1';

  let mockSession;
  let subscription;

  const mockSubscriptionFindById = (doc) => {
    const query = {
      session: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      then: jest.fn((cb) => cb(doc)),
    };
    Subscription.findById.mockReturnValue(query);
    return query;
  };

  beforeEach(() => {
    PaymentLog.__reset();

    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    jest.spyOn(mongoose, 'startSession').mockResolvedValue(mockSession);

    subscription = {
      _id: 'sub_1',
      user: userId,
      partner: partnerId,
      tiffin: { _id: 'tiffin_1', title: 'Ghar Ka Khana' },
      paymentId: 'pay_1',
      totalAmount: 2400,
      grandTotal: 2500,
      paymentStatus: 'pending',
      status: 'pending_payment',
      save: jest.fn().mockResolvedValue(true),
    };

    generateDeliveriesForSubscription.mockResolvedValue({ success: true });
    verifyPaymentSignature.mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows a processed refund in the owner history and counts it in totalRefunds', async () => {
    mockSubscriptionFindById(subscription);
    createRefund.mockResolvedValue({ success: true, refundId: 'rfnd_1' });

    await processRefundForSubscription('sub_1', 1200, 'Customer cancelled');

    const { payments, summaryStats } = await fetchPaymentHistory(userId, {});

    expect(payments).toHaveLength(1);
    expect(payments[0]).toMatchObject({
      type: 'refund',
      status: 'success',
      refundId: 'rfnd_1',
      amount: 1200,
      userId,
      partnerId,
    });
    expect(summaryStats.totalRefunds).toBe(1);
    // A refund is money out, so it must not inflate the spend counters.
    expect(summaryStats.totalSpent).toBe(0);
    expect(summaryStats.totalTransactions).toBe(0);
  });

  it('shows a signature-mismatch failure in the owner history and counts it in totalFailed', async () => {
    mockSubscriptionFindById(subscription);
    verifyPaymentSignature.mockReturnValue(false);

    await expect(
      verifySubscriptionPayment({
        razorpay_payment_id: 'pay_bad',
        razorpay_order_id: 'order_bad',
        razorpay_signature: 'sig_bad',
        subscriptionId: 'sub_1',
      }),
    ).rejects.toThrow('Invalid payment signature');

    const { payments, summaryStats } = await fetchPaymentHistory(userId, {});

    expect(payments).toHaveLength(1);
    expect(payments[0]).toMatchObject({
      type: 'payment',
      status: 'failed',
      orderId: 'order_bad',
      errorCode: 'SIGNATURE_MISMATCH',
      userId,
      partnerId,
    });
    expect(summaryStats.totalFailed).toBe(1);
    expect(summaryStats.totalSpent).toBe(0);
  });

  it('logs a COD confirmation as a pending payment owned by the customer', async () => {
    mockSubscriptionFindById(subscription);

    await confirmCod('sub_1');

    const { payments, summaryStats } = await fetchPaymentHistory(userId, {});

    expect(payments).toHaveLength(1);
    expect(payments[0]).toMatchObject({
      type: 'payment',
      status: 'pending',
      amount: 2500,
      subscriptionId: 'sub_1',
      userId,
      partnerId,
    });
    // Cash is only collected on the first delivery, so nothing is "spent" yet.
    expect(summaryStats.totalSpent).toBe(0);
    expect(summaryStats.totalTransactions).toBe(0);
  });

  it('does not log a second COD entry when an already-active order is re-confirmed', async () => {
    mockSubscriptionFindById({ ...subscription, status: 'active' });

    await confirmCod('sub_1');

    expect(PaymentLog.__store).toHaveLength(0);
  });

  it('resolves owner refs from populated documents as well as raw ids', async () => {
    mockSubscriptionFindById({
      ...subscription,
      user: { _id: userId, name: 'Owner' },
      partner: { _id: partnerId, businessName: 'Tiffin Co' },
    });

    await confirmCod('sub_1');

    expect(PaymentLog.__store[0]).toMatchObject({ userId, partnerId });
  });

  it('stores the subscription partner id and populates it with Partner fields', async () => {
    mockSubscriptionFindById(subscription);
    createRefund.mockResolvedValue({ success: true, refundId: 'rfnd_1' });

    await processRefundForSubscription('sub_1', 1200, 'Customer cancelled');
    await fetchPaymentHistory(userId, {});

    // The id written must be Subscription.partner (a Partner id) ...
    expect(PaymentLog.__store[0].partnerId).toBe(subscription.partner);

    // ... and the read must select fields that exist on Partner. Selecting the
    // User fields `name email` is what made the populated partner come back
    // empty even once the ref was right.
    const partnerPopulate = PaymentLog.__populates.find((p) => p.path === 'partnerId');
    expect(partnerPopulate).toBeDefined();
    expect(partnerPopulate.select).toContain('businessName');
    expect(partnerPopulate.select).not.toMatch(/\bname\b/);
    expect(partnerPopulate.select).not.toContain('email');
  });

  it('keeps another customer from seeing these logs', async () => {
    mockSubscriptionFindById(subscription);
    createRefund.mockResolvedValue({ success: true, refundId: 'rfnd_1' });

    await processRefundForSubscription('sub_1', 1200, 'Customer cancelled');

    const { payments, summaryStats, pagination } = await fetchPaymentHistory(otherUserId, {});

    expect(payments).toHaveLength(0);
    expect(pagination.total).toBe(0);
    expect(summaryStats).toEqual({
      totalSpent: 0,
      totalTransactions: 0,
      totalRefunds: 0,
      totalFailed: 0,
    });
  });
});
