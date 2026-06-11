/**
 * Unit tests for paymentController.js
 *
 * Strategy:
 *  - All Mongoose models are mocked — no real DB connections.
 *  - The razorpayService is mocked — no real API calls.
 *  - Tests cover: createOrder, verifyPayment, processRefund, getPaymentHistory
 */

const {
  createOrder,
  verifyPayment,
  processRefund,
  getPaymentHistory
} = require('../paymentController');

const Subscription = require('../../models/Subscription');
const PaymentLog = require('../../models/PaymentLog');

// ── Mock all external dependencies ──────────────────────────────────────────
jest.mock('../../models/User');
jest.mock('../../models/Partner');
jest.mock('../../models/Subscription');
jest.mock('../../models/PaymentLog');
jest.mock('../../utils/logger', () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn() }));
jest.mock('../../services/razorpayService', () => ({
  createLinkedAccount: jest.fn(),
  addBankAccount: jest.fn(),
  createOrderWithTransfer: jest.fn(),
  verifyPaymentSignature: jest.fn(),
  createRefund: jest.fn()
}));
jest.mock('../../services/deliveryService', () => ({
  generateDeliveriesForSubscription: jest.fn()
}));
jest.mock('../../services/socketService', () => ({
  emitNotification: jest.fn()
}));
jest.mock('../../services/paymentService', () => ({
  fetchPaymentHistory: jest.fn()
}));

const {
  createOrderWithTransfer,
  verifyPaymentSignature,
  createRefund
} = require('../../services/razorpayService');

// ── Shared helpers ─────────────────────────────────────────────────────────
const makeRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis()
});

const makeReq = (overrides = {}) => ({
  user: { id: 'user123' },
  body: {},
  query: {},
  ...overrides
});

const mockPartner = {
  _id: 'partner123',
  razorpayAccountId: 'acc_mock123',
  commissionRate: 0.10
};

const mockSubscription = (overrides = {}) => ({
  _id: 'sub123',
  user: 'user123',
  partner: mockPartner,
  tiffin: { _id: 'tiffin123', name: 'Dal Makhani Box' },
  grandTotal: 1000,
  totalAmount: 1000,
  paymentStatus: 'pending',
  status: 'pending',
  orderId: null,
  paymentId: null,
  platformCommission: null,
  providerAmount: null,
  save: jest.fn().mockResolvedValue(true),
  ...overrides
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Payment Controller', () => {

  afterEach(() => jest.clearAllMocks());

  // ── createOrder ──────────────────────────────────────────────────────────
  describe('createOrder', () => {

    it('should return 404 if subscription not found', async () => {
      const req = makeReq({ body: { subscriptionId: 'nonexistent' } });
      const res = makeRes();
      Subscription.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(null) })
      });

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Subscription not found' }));
    });

    it('should return 403 if subscription belongs to a different user', async () => {
      const req = makeReq({ body: { subscriptionId: 'sub123' } });
      const res = makeRes();
      const sub = mockSubscription({ user: 'differentUser' });
      Subscription.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(sub) })
      });

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Unauthorized' }));
    });

    it('should return 400 if subscription is already paid', async () => {
      const req = makeReq({ body: { subscriptionId: 'sub123' } });
      const res = makeRes();
      const sub = mockSubscription({ paymentStatus: 'paid' });
      Subscription.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(sub) })
      });

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Subscription already paid' }));
    });

    it('should return 400 if partner has no Razorpay account', async () => {
      const req = makeReq({ body: { subscriptionId: 'sub123' } });
      const res = makeRes();
      const sub = mockSubscription({ partner: { ...mockPartner, razorpayAccountId: null } });
      Subscription.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(sub) })
      });

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Partner payment account not setup' }));
    });

    it('should return 200 with orderId and call createOrderWithTransfer on success', async () => {
      const req = makeReq({ body: { subscriptionId: 'sub123' } });
      const res = makeRes();
      const sub = mockSubscription();
      Subscription.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(sub) })
      });
      createOrderWithTransfer.mockResolvedValue({ success: true, orderId: 'order_abc' });
      PaymentLog.create.mockResolvedValue({});

      await createOrder(req, res);

      expect(createOrderWithTransfer).toHaveBeenCalledWith(expect.objectContaining({
        amount: 1000,
        currency: 'INR',
        partnerAccountId: 'acc_mock123'
      }));
      expect(sub.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        orderId: 'order_abc',
        currency: 'INR'
      }));
    });

    it('should correctly calculate platform commission and provider amount', async () => {
      const req = makeReq({ body: { subscriptionId: 'sub123' } });
      const res = makeRes();
      const sub = mockSubscription({ grandTotal: 2000, partner: { ...mockPartner, commissionRate: 0.15 } });
      Subscription.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(sub) })
      });
      createOrderWithTransfer.mockResolvedValue({ success: true, orderId: 'order_xyz' });
      PaymentLog.create.mockResolvedValue({});

      await createOrder(req, res);

      // 15% of 2000 = 300 platform commission, 1700 provider
      expect(sub.platformCommission).toBe(300);
      expect(sub.providerAmount).toBe(1700);
    });

    it('should return 500 if createOrderWithTransfer fails', async () => {
      const req = makeReq({ body: { subscriptionId: 'sub123' } });
      const res = makeRes();
      const sub = mockSubscription();
      Subscription.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(sub) })
      });
      createOrderWithTransfer.mockResolvedValue({ success: false, error: 'Razorpay error' });

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Failed to create order' }));
    });
  });

  // ── verifyPayment ─────────────────────────────────────────────────────────
  describe('verifyPayment', () => {
    const validBody = {
      razorpay_payment_id: 'pay_123',
      razorpay_order_id: 'order_abc',
      razorpay_signature: 'sig_xyz',
      subscriptionId: 'sub123'
    };

    it('should return 400 and log failure if signature is invalid', async () => {
      const req = makeReq({ body: validBody });
      const res = makeRes();
      verifyPaymentSignature.mockReturnValue(false);
      PaymentLog.create.mockResolvedValue({});

      await verifyPayment(req, res);

      expect(PaymentLog.create).toHaveBeenCalledWith(expect.objectContaining({
        status: 'failed',
        errorCode: 'SIGNATURE_MISMATCH'
      }));
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid payment signature' }));
    });

    it('should return 404 if subscription not found after valid signature', async () => {
      const req = makeReq({ body: validBody });
      const res = makeRes();
      verifyPaymentSignature.mockReturnValue(true);
      Subscription.findById.mockResolvedValue(null);

      await verifyPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should activate subscription and return 200 on valid signature', async () => {
      const req = makeReq({ body: validBody });
      const res = makeRes();
      const sub = mockSubscription();
      verifyPaymentSignature.mockReturnValue(true);
      // Mock Subscription.findById to support chaining .populate() for the second call
      Subscription.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(sub),
        then: function(resolve) { resolve(sub); } // Allows await Subscription.findById()
      });
      PaymentLog.findOneAndUpdate.mockResolvedValue({});

      await verifyPayment(req, res);

      // Subscription must be marked paid and active
      expect(sub.paymentStatus).toBe('paid');
      expect(sub.status).toBe('active');
      expect(sub.paymentId).toBe('pay_123');
      expect(sub.save).toHaveBeenCalled();

      // Payment log must be updated to success
      expect(PaymentLog.findOneAndUpdate).toHaveBeenCalledWith(
        { orderId: 'order_abc' },
        expect.objectContaining({ status: 'success', paymentId: 'pay_123' })
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        subscription: expect.objectContaining({ status: 'active', paymentStatus: 'paid' })
      }));
    });

    it('should NOT update subscription if signature is invalid (prevents race condition exploits)', async () => {
      const req = makeReq({ body: validBody });
      const res = makeRes();
      verifyPaymentSignature.mockReturnValue(false);
      PaymentLog.create.mockResolvedValue({});

      await verifyPayment(req, res);

      // Subscription.findById should NOT be called after a failed verification
      expect(Subscription.findById).not.toHaveBeenCalled();
    });
  });

  // ── processRefund ─────────────────────────────────────────────────────────
  describe('processRefund', () => {

    it('should return 404 if subscription not found', async () => {
      const req = makeReq({ body: { subscriptionId: 'ghost', amount: 500, reason: 'test' } });
      const res = makeRes();
      Subscription.findById.mockResolvedValue(null);

      await processRefund(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if subscription has no paymentId', async () => {
      const req = makeReq({ body: { subscriptionId: 'sub123', amount: 500, reason: 'test' } });
      const res = makeRes();
      Subscription.findById.mockResolvedValue(mockSubscription({ paymentId: null }));

      await processRefund(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'No payment found for this subscription'
      }));
    });

    it('should process refund, cancel subscription, and log it on success', async () => {
      const req = makeReq({ body: { subscriptionId: 'sub123', amount: 800, reason: 'Customer request' } });
      const res = makeRes();
      const sub = mockSubscription({ paymentId: 'pay_456' });
      Subscription.findById.mockResolvedValue(sub);
      createRefund.mockResolvedValue({ success: true, refundId: 'ref_789' });
      PaymentLog.create.mockResolvedValue({});

      await processRefund(req, res);

      expect(createRefund).toHaveBeenCalledWith('pay_456', 800, expect.any(Object));
      expect(sub.paymentStatus).toBe('refunded');
      expect(sub.status).toBe('cancelled');
      expect(sub.save).toHaveBeenCalled();
      expect(PaymentLog.create).toHaveBeenCalledWith(expect.objectContaining({
        type: 'refund',
        status: 'success',
        refundId: 'ref_789'
      }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        refundId: 'ref_789'
      }));
    });

    it('should return 500 if Razorpay refund fails', async () => {
      const req = makeReq({ body: { subscriptionId: 'sub123', amount: 500, reason: 'test' } });
      const res = makeRes();
      Subscription.findById.mockResolvedValue(mockSubscription({ paymentId: 'pay_456' }));
      createRefund.mockResolvedValue({ success: false, error: 'Razorpay declined' });

      await processRefund(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Refund failed' }));
    });
  });

  // ── getPaymentHistory ─────────────────────────────────────────────────────
  describe('getPaymentHistory', () => {

    it('should return paginated payment logs for the authenticated user', async () => {
      const req = makeReq({ query: { limit: '10', page: '1' } });
      const res = makeRes();
      const mockLogs = [{ _id: 'log1', amount: 500 }, { _id: 'log2', amount: 1000 }];

      // Build a proper chain: .sort().limit().skip().populate().populate()
      const populateChain2 = jest.fn().mockResolvedValue(mockLogs);
      const populateChain1 = jest.fn().mockReturnValue({ populate: populateChain2 });
      PaymentLog.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        populate: populateChain1
      });
      PaymentLog.countDocuments.mockResolvedValue(2);

      await getPaymentHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        payments: mockLogs,
        pagination: expect.objectContaining({ total: 2, page: 1 })
      }));
    });

    it('should filter by type and status when provided', async () => {
      const req = makeReq({ query: { type: 'refund', status: 'success', limit: '5', page: '1' } });
      const res = makeRes();
      PaymentLog.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([])
      });
      PaymentLog.countDocuments.mockResolvedValue(0);

      await getPaymentHistory(req, res);

      expect(PaymentLog.find).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123',
        type: 'refund',
        status: 'success'
      }));
    });
  });
});
