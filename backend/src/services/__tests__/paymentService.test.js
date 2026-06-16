const {
  createSubscriptionOrder,
  verifySubscriptionPayment,
  processRefundForSubscription,
  fetchPaymentHistory,
} = require('../paymentService');

const Subscription = require('../../models/Subscription');
const PaymentLog = require('../../models/PaymentLog');

jest.mock('../../models/User');
jest.mock('../../models/Partner');
jest.mock('../../models/Subscription');
jest.mock('../../models/PaymentLog');
jest.mock('../../utils/logger', () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn() }));
jest.mock('../razorpayService', () => ({
  createLinkedAccount: jest.fn(),
  addBankAccount: jest.fn(),
  createOrderWithTransfer: jest.fn(),
  verifyPaymentSignature: jest.fn(),
  createRefund: jest.fn(),
}));
jest.mock('../deliveryService', () => ({
  generateDeliveriesForSubscription: jest.fn(),
}));
jest.mock('../socketService', () => ({
  emitNotification: jest.fn(),
}));

const {
  createOrderWithTransfer,
  verifyPaymentSignature,
  createRefund,
} = require('../razorpayService');

const mockPartner = {
  _id: 'partner123',
  razorpayAccountId: 'acc_mock123',
  commissionRate: 0.1,
};

const mockSubscription = (overrides = {}) => ({
  _id: 'sub123',
  user: {
    toString: () => 'user123',
  },
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
  ...overrides,
});

describe('Payment Service', () => {
  afterEach(() => jest.clearAllMocks());

  describe('createSubscriptionOrder', () => {
    it('should throw 404 if subscription not found', async () => {
      Subscription.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(null) }),
      });

      await expect(createSubscriptionOrder('user123', 'nonexistent')).rejects.toThrow(
        'Subscription not found',
      );
    });

    it('should throw 403 if subscription belongs to a different user', async () => {
      const sub = mockSubscription({ user: { toString: () => 'differentUser' } });
      Subscription.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(sub) }),
      });

      await expect(createSubscriptionOrder('user123', 'sub123')).rejects.toThrow('Unauthorized');
    });

    it('should throw error if subscription is already paid', async () => {
      const sub = mockSubscription({ paymentStatus: 'paid' });
      Subscription.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(sub) }),
      });

      await expect(createSubscriptionOrder('user123', 'sub123')).rejects.toThrow(
        'Subscription already paid',
      );
    });

    it('should throw error if partner has no Razorpay account', async () => {
      const sub = mockSubscription({ partner: { ...mockPartner, razorpayAccountId: null } });
      Subscription.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(sub) }),
      });

      await expect(createSubscriptionOrder('user123', 'sub123')).rejects.toThrow(
        'Partner payment account not setup',
      );
    });

    it('should return orderData and call createOrderWithTransfer on success', async () => {
      const sub = mockSubscription();
      Subscription.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(sub) }),
      });
      createOrderWithTransfer.mockResolvedValue({ success: true, orderId: 'order_abc' });
      PaymentLog.create.mockResolvedValue({});

      const result = await createSubscriptionOrder('user123', 'sub123');

      expect(createOrderWithTransfer).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 1000,
          currency: 'INR',
          partnerAccountId: 'acc_mock123',
        }),
      );
      expect(sub.save).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          orderId: 'order_abc',
          currency: 'INR',
        }),
      );
    });

    it('should correctly calculate platform commission and provider amount', async () => {
      const sub = mockSubscription({
        grandTotal: 2000,
        partner: { ...mockPartner, commissionRate: 0.15 },
      });
      Subscription.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(sub) }),
      });
      createOrderWithTransfer.mockResolvedValue({ success: true, orderId: 'order_xyz' });
      PaymentLog.create.mockResolvedValue({});

      await createSubscriptionOrder('user123', 'sub123');

      expect(sub.platformCommission).toBe(300);
      expect(sub.providerAmount).toBe(1700);
    });
  });

  describe('verifySubscriptionPayment', () => {
    const validBody = {
      razorpay_payment_id: 'pay_123',
      razorpay_order_id: 'order_abc',
      razorpay_signature: 'sig_xyz',
      subscriptionId: 'sub123',
    };

    it('should throw error and log failure if signature is invalid', async () => {
      verifyPaymentSignature.mockReturnValue(false);
      PaymentLog.create.mockResolvedValue({});

      await expect(verifySubscriptionPayment(validBody)).rejects.toThrow(
        'Invalid payment signature',
      );

      expect(PaymentLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          errorCode: 'SIGNATURE_MISMATCH',
        }),
      );
    });

    it('should throw 404 if subscription not found after valid signature', async () => {
      verifyPaymentSignature.mockReturnValue(true);
      Subscription.findById.mockResolvedValue(null);

      await expect(verifySubscriptionPayment(validBody)).rejects.toThrow('Subscription not found');
    });

    it('should activate subscription on valid signature', async () => {
      const sub = mockSubscription();
      verifyPaymentSignature.mockReturnValue(true);
      Subscription.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(sub),
        then: function (resolve) {
          resolve(sub);
        },
      });
      PaymentLog.findOneAndUpdate.mockResolvedValue({});

      await verifySubscriptionPayment(validBody);

      expect(sub.paymentStatus).toBe('paid');
      expect(sub.status).toBe('active');
      expect(sub.paymentId).toBe('pay_123');
      expect(sub.save).toHaveBeenCalled();

      expect(PaymentLog.findOneAndUpdate).toHaveBeenCalledWith(
        { orderId: 'order_abc' },
        expect.objectContaining({ status: 'success', paymentId: 'pay_123' }),
      );
    });
  });

  describe('processRefundForSubscription', () => {
    it('should throw 404 if subscription not found', async () => {
      Subscription.findById.mockResolvedValue(null);

      await expect(processRefundForSubscription('ghost', 500, 'test')).rejects.toThrow(
        'Subscription not found',
      );
    });

    it('should throw error if subscription has no paymentId', async () => {
      Subscription.findById.mockResolvedValue(mockSubscription({ paymentId: null }));

      await expect(processRefundForSubscription('sub123', 500, 'test')).rejects.toThrow(
        'No payment found for this subscription',
      );
    });

    it('should process refund, cancel subscription, and log it on success', async () => {
      const sub = mockSubscription({ paymentId: 'pay_456' });
      Subscription.findById.mockResolvedValue(sub);
      createRefund.mockResolvedValue({ success: true, refundId: 'ref_789' });
      PaymentLog.create.mockResolvedValue({});

      const refundId = await processRefundForSubscription('sub123', 800, 'Customer request');

      expect(createRefund).toHaveBeenCalledWith('pay_456', 800, expect.any(Object));
      expect(sub.paymentStatus).toBe('refunded');
      expect(sub.status).toBe('cancelled');
      expect(sub.save).toHaveBeenCalled();
      expect(PaymentLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'refund',
          status: 'success',
          refundId: 'ref_789',
        }),
      );
      expect(refundId).toBe('ref_789');
    });
  });

  describe('fetchPaymentHistory', () => {
    it('should filter by type and status when provided', async () => {
      PaymentLog.find.mockImplementation(() => {
        return {
          sort: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue([]),
          }),
          then: function (resolve) {
            resolve([]);
          },
          filter: function () {
            return [];
          },
        };
      });
      PaymentLog.countDocuments.mockResolvedValue(0);

      await fetchPaymentHistory('user123', {
        type: 'refund',
        status: 'success',
        limit: '5',
        page: '1',
      });

      expect(PaymentLog.find).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          type: 'refund',
          status: 'success',
        }),
      );
    });
  });
});
