const mongoose = require('mongoose');
const { verifySubscriptionPayment, confirmCod } = require('../paymentService');
const Subscription = require('../../models/Subscription');
const PaymentLog = require('../../models/PaymentLog');
const { generateDeliveriesForSubscription } = require('../deliveryService');
const { verifyPaymentSignature } = require('../razorpayService');

jest.mock('../../models/Subscription');
jest.mock('../../models/PaymentLog');
jest.mock('../razorpayService');
jest.mock('../deliveryService');
jest.mock('../socketService');
jest.mock('../../models/User');
jest.mock('../../models/Partner');

describe('paymentService Transactions', () => {
  let mockSession;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    jest.spyOn(mongoose, 'startSession').mockResolvedValue(mockSession);
    verifyPaymentSignature.mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('verifySubscriptionPayment', () => {
    it('should commit transaction and save subscription on successful delivery generation', async () => {
      const mockSubscription = {
        _id: 'sub_123',
        paymentId: '',
        razorpaySignature: '',
        paymentStatus: 'pending',
        status: 'pending',
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock Subscription query
      const queryMock = {
        session: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        then: jest.fn((cb) => cb(mockSubscription)),
      };
      Subscription.findById.mockReturnValue(queryMock);

      // Mock delivery service success
      generateDeliveriesForSubscription.mockResolvedValue({ success: true });

      // Mock PaymentLog findOneAndUpdate
      const paymentLogMock = {
        session: jest.fn().mockReturnThis(),
        then: jest.fn((cb) => cb({})),
      };
      PaymentLog.findOneAndUpdate.mockReturnValue(paymentLogMock);

      const result = await verifySubscriptionPayment({
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'sig_123',
        subscriptionId: 'sub_123',
      });

      expect(mongoose.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(mockSubscription.save).toHaveBeenCalledWith({ session: mockSession });
      expect(generateDeliveriesForSubscription).toHaveBeenCalledWith(mockSubscription, mockSession);
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(result).toBe(mockSubscription);
    });

    it('should abort transaction and throw error if delivery generation fails', async () => {
      const mockSubscription = {
        _id: 'sub_123',
        paymentId: '',
        razorpaySignature: '',
        paymentStatus: 'pending',
        status: 'pending',
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock Subscription query
      const queryMock = {
        session: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        then: jest.fn((cb) => cb(mockSubscription)),
      };
      Subscription.findById.mockReturnValue(queryMock);

      // Mock delivery service failure
      generateDeliveriesForSubscription.mockResolvedValue({
        success: false,
        message: 'Delivery creation failed',
      });

      await expect(
        verifySubscriptionPayment({
          razorpay_payment_id: 'pay_123',
          razorpay_order_id: 'order_123',
          razorpay_signature: 'sig_123',
          subscriptionId: 'sub_123',
        }),
      ).rejects.toThrow('Delivery generation failed: Delivery creation failed');

      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
    });
  });

  describe('confirmCod', () => {
    it('should commit transaction on success', async () => {
      const mockSubscription = {
        _id: 'sub_123',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        status: 'active',
        save: jest.fn().mockResolvedValue(true),
      };

      const queryMock = {
        session: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        then: jest.fn((cb) => cb(mockSubscription)),
      };
      Subscription.findById.mockReturnValue(queryMock);
      generateDeliveriesForSubscription.mockResolvedValue({ success: true });

      const result = await confirmCod('sub_123');

      expect(mongoose.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(mockSubscription.save).toHaveBeenCalledWith({ session: mockSession });
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(result).toBe(mockSubscription);
    });

    it('should abort transaction if delivery fails', async () => {
      const mockSubscription = {
        _id: 'sub_123',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        status: 'active',
        save: jest.fn().mockResolvedValue(true),
      };

      const queryMock = {
        session: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        then: jest.fn((cb) => cb(mockSubscription)),
      };
      Subscription.findById.mockReturnValue(queryMock);
      generateDeliveriesForSubscription.mockResolvedValue({ success: false, message: 'Fails' });

      await expect(confirmCod('sub_123')).rejects.toThrow('Delivery generation failed: Fails');

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
    });
  });
});
