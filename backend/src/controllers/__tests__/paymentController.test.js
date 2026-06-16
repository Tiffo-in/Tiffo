const {
  createOrder,
  verifyPayment,
  processRefund,
  getPaymentHistory,
} = require('../paymentController');

const paymentService = require('../../services/paymentService');

jest.mock('../../services/paymentService', () => ({
  createSubscriptionOrder: jest.fn(),
  verifySubscriptionPayment: jest.fn(),
  processRefundForSubscription: jest.fn(),
  fetchPaymentHistory: jest.fn(),
  setupPartnerPaymentAccount: jest.fn(),
  confirmCod: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
}));

const makeRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

const makeReq = (overrides = {}) => ({
  user: { id: 'user123' },
  body: {},
  query: {},
  ...overrides,
});

describe('Payment Controller', () => {
  afterEach(() => jest.clearAllMocks());

  describe('createOrder', () => {
    it('should return 200 with order data on success', async () => {
      const req = makeReq({ body: { subscriptionId: 'sub123' } });
      const res = makeRes();

      paymentService.createSubscriptionOrder.mockResolvedValue({ orderId: 'order_123', currency: 'INR' });
      process.env.RAZORPAY_KEY_ID = 'test_key';

      await createOrder(req, res);

      expect(paymentService.createSubscriptionOrder).toHaveBeenCalledWith('user123', 'sub123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ orderId: 'order_123', razorpayKey: 'test_key' }));
    });

    it('should return 400 for known errors', async () => {
      const req = makeReq({ body: { subscriptionId: 'sub123' } });
      const res = makeRes();

      paymentService.createSubscriptionOrder.mockRejectedValue(new Error('Subscription already paid'));

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Subscription already paid' }));
    });

    it('should return 500 on unexpected errors', async () => {
      const req = makeReq({ body: { subscriptionId: 'sub123' } });
      const res = makeRes();

      paymentService.createSubscriptionOrder.mockRejectedValue(new Error('Unexpected error'));

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('verifyPayment', () => {
    it('should return 200 on success', async () => {
      const req = makeReq();
      const res = makeRes();
      const mockSub = { _id: 'sub123', status: 'active', paymentStatus: 'paid' };

      paymentService.verifySubscriptionPayment.mockResolvedValue(mockSub);

      await verifyPayment(req, res);

      expect(paymentService.verifySubscriptionPayment).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should return 400 for invalid signature', async () => {
      const req = makeReq();
      const res = makeRes();

      paymentService.verifySubscriptionPayment.mockRejectedValue(new Error('Invalid payment signature'));

      await verifyPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('processRefund', () => {
    it('should return 200 on success', async () => {
      const req = makeReq({ body: { subscriptionId: 'sub123', amount: 500, reason: 'test' } });
      const res = makeRes();

      paymentService.processRefundForSubscription.mockResolvedValue('ref_123');

      await processRefund(req, res);

      expect(paymentService.processRefundForSubscription).toHaveBeenCalledWith('sub123', 500, 'test');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, refundId: 'ref_123' }));
    });

    it('should return 400 for missing payment', async () => {
      const req = makeReq();
      const res = makeRes();

      paymentService.processRefundForSubscription.mockRejectedValue(new Error('No payment found for this subscription'));

      await processRefund(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getPaymentHistory', () => {
    it('should return 200 and history on success', async () => {
      const req = makeReq({ query: { page: 1 } });
      const res = makeRes();

      const mockResult = { payments: [], pagination: {} };
      paymentService.fetchPaymentHistory.mockResolvedValue(mockResult);

      await getPaymentHistory(req, res);

      expect(paymentService.fetchPaymentHistory).toHaveBeenCalledWith('user123', { page: 1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });
});
