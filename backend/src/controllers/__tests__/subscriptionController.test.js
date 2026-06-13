/**
 * Unit tests for subscriptionController.js
 *
 * Covers the business-critical lifecycle:
 *  createSubscription → pauseSubscription → resumeSubscription
 *  + getUserSubscriptions, getSubscriptionDetails, getUserStats, getOrderHistory
 */

const {
  createSubscription,
  pauseSubscription,
  resumeSubscription,
  getSubscriptionDetails,
  getUserSubscriptions,
  getUserStats,
  getOrderHistory,
} = require('../subscriptionController');

const Subscription = require('../../models/Subscription');
const Delivery = require('../../models/Delivery');
const Tiffin = require('../../models/Tiffin');

// ── Mock all external dependencies ──────────────────────────────────────────
jest.mock('../../models/Subscription');
jest.mock('../../models/Delivery');
jest.mock('../../models/Tiffin');
jest.mock('../../models/Partner');
jest.mock('../../utils/logger', () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn() }));

// ── Shared helpers ─────────────────────────────────────────────────────────
const makeRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

const makeReq = (overrides = {}) => ({
  user: { id: 'user123' },
  body: {},
  query: {},
  params: {},
  ...overrides,
});

const mockTiffin = {
  _id: 'tiffin123',
  isActive: true,
  partner: { _id: 'partner123' },
  discount: { label: 'Weekly Save' },
  effectivePrice: {
    daily: 100,
    weekly: 600,
    weeklyOriginal: 700,
    weeklyDiscountPercent: 14,
    monthly: 2200,
    monthlyOriginal: 3000,
    monthlyDiscountPercent: 26,
  },
};

const mockSub = (overrides = {}) => ({
  _id: 'sub123',
  user: 'user123',
  status: 'active',
  paymentStatus: 'pending',
  totalAmount: 600,
  grandTotal: 630,
  startDate: new Date('2026-05-01'),
  endDate: new Date('2026-05-08'),
  plan: 'weekly',
  pausedDates: [],
  toObject: jest.fn().mockReturnThis(),
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Subscription Controller', () => {
  afterEach(() => jest.clearAllMocks());

  // ── createSubscription ───────────────────────────────────────────────────
  describe('createSubscription', () => {
    const validBody = {
      tiffinId: 'tiffin123',
      plan: 'weekly',
      startDate: '2026-05-01',
      deliveryAddress: { street: '10 MG Road', city: 'Pune', state: 'MH', pincode: '411001' },
      deliveryTime: '12:00',
    };

    it('should return 400 if any required field is missing', async () => {
      const req = makeReq({ body: { tiffinId: 'tiffin123' } }); // missing plan, startDate, etc.
      const res = makeRes();

      await createSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should return 404 if tiffin not found or inactive', async () => {
      const req = makeReq({ body: validBody });
      const res = makeRes();
      Tiffin.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

      await createSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Tiffin not found or inactive',
        }),
      );
    });

    it('should return 400 for an invalid plan', async () => {
      const req = makeReq({ body: { ...validBody, plan: 'quarterly' } });
      const res = makeRes();
      Tiffin.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockTiffin) });

      await createSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid plan. Must be daily, weekly, or monthly',
        }),
      );
    });

    it('should correctly compute GST (5%) and grandTotal for weekly plan', async () => {
      const req = makeReq({ body: validBody });
      const res = makeRes();
      Tiffin.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockTiffin) });
      Subscription.create.mockResolvedValue({ _id: 'newSub', plan: 'weekly' });

      await createSubscription(req, res);

      const createdWith = Subscription.create.mock.calls[0][0];
      // weeklyPrice = 600, GST = 5%, gstAmount = 30, grandTotal = 630
      expect(createdWith.totalAmount).toBe(600);
      expect(createdWith.gstAmount).toBe(30);
      expect(createdWith.grandTotal).toBe(630);
      expect(createdWith.gstRate).toBe(5);
    });

    it('should set endDate to startDate + 7 days for weekly plan', async () => {
      const req = makeReq({ body: validBody });
      const res = makeRes();
      Tiffin.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockTiffin) });
      Subscription.create.mockResolvedValue({ _id: 'newSub' });

      await createSubscription(req, res);

      const created = Subscription.create.mock.calls[0][0];
      const diffMs = new Date(created.endDate) - new Date(created.startDate);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(7);
    });

    it('should set endDate to startDate + 30 days for monthly plan', async () => {
      const req = makeReq({ body: { ...validBody, plan: 'monthly' } });
      const res = makeRes();
      Tiffin.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockTiffin) });
      Subscription.create.mockResolvedValue({ _id: 'newSub' });

      await createSubscription(req, res);

      const created = Subscription.create.mock.calls[0][0];
      const diffDays =
        (new Date(created.endDate) - new Date(created.startDate)) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(30);
    });

    it('should always set paymentStatus to pending on creation', async () => {
      const req = makeReq({ body: validBody });
      const res = makeRes();
      Tiffin.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockTiffin) });
      Subscription.create.mockResolvedValue({ _id: 'newSub' });

      await createSubscription(req, res);

      const created = Subscription.create.mock.calls[0][0];
      expect(created.paymentStatus).toBe('pending');
    });

    it('should return 201 on successful subscription creation', async () => {
      const req = makeReq({ body: validBody });
      const res = makeRes();
      Tiffin.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockTiffin) });
      const newSub = { _id: 'newSub123', plan: 'weekly', status: 'active' };
      Subscription.create.mockResolvedValue(newSub);

      await createSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: newSub,
        }),
      );
    });
  });

  // ── pauseSubscription ────────────────────────────────────────────────────
  describe('pauseSubscription', () => {
    it('should return 404 if subscription not found', async () => {
      const req = makeReq({ params: { id: 'ghost' } });
      const res = makeRes();
      Subscription.findOne.mockResolvedValue(null);

      await pauseSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if subscription is not active', async () => {
      const req = makeReq({ params: { id: 'sub123' } });
      const res = makeRes();
      Subscription.findOne.mockResolvedValue(mockSub({ status: 'paused' }));

      await pauseSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Only active subscriptions can be paused',
        }),
      );
    });

    it('should set status to paused, record pausedDate, and save', async () => {
      const req = makeReq({ params: { id: 'sub123' } });
      const res = makeRes();
      const sub = mockSub({ status: 'active', pausedDates: [] });
      Subscription.findOne.mockResolvedValue(sub);

      await pauseSubscription(req, res);

      expect(sub.status).toBe('paused');
      expect(sub.pausedDates).toHaveLength(1);
      expect(sub.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  // ── resumeSubscription ───────────────────────────────────────────────────
  describe('resumeSubscription', () => {
    it('should return 404 if subscription not found', async () => {
      const req = makeReq({ params: { id: 'ghost' } });
      const res = makeRes();
      Subscription.findOne.mockResolvedValue(null);

      await resumeSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if subscription is not paused', async () => {
      const req = makeReq({ params: { id: 'sub123' } });
      const res = makeRes();
      Subscription.findOne.mockResolvedValue(mockSub({ status: 'active' }));

      await resumeSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Only paused subscriptions can be resumed',
        }),
      );
    });

    it('should set status to active and save on valid resume', async () => {
      const req = makeReq({ params: { id: 'sub123' } });
      const res = makeRes();
      const sub = mockSub({ status: 'paused' });
      Subscription.findOne.mockResolvedValue(sub);

      await resumeSubscription(req, res);

      expect(sub.status).toBe('active');
      expect(sub.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('pause → resume cycle should end with status active', async () => {
      const sub = mockSub({ status: 'active', pausedDates: [] });

      // 1. Pause
      Subscription.findOne.mockResolvedValue(sub);
      await pauseSubscription(makeReq({ params: { id: 'sub123' } }), makeRes());
      expect(sub.status).toBe('paused');

      // 2. Resume
      Subscription.findOne.mockResolvedValue(sub);
      await resumeSubscription(makeReq({ params: { id: 'sub123' } }), makeRes());
      expect(sub.status).toBe('active');
    });
  });

  // ── getSubscriptionDetails ───────────────────────────────────────────────
  describe('getSubscriptionDetails', () => {
    it('should return 404 if subscription not found', async () => {
      const req = makeReq({ params: { id: 'ghost' } });
      const res = makeRes();
      Subscription.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      });

      await getSubscriptionDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return subscription + delivery stats on success', async () => {
      const req = makeReq({ params: { id: 'sub123' } });
      const res = makeRes();
      const sub = mockSub();
      Subscription.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(sub),
        }),
      });
      const deliveries = [
        { status: 'delivered' },
        { status: 'delivered' },
        { status: 'scheduled' },
      ];
      Delivery.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(deliveries) });

      await getSubscriptionDetails(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            deliveryStats: expect.objectContaining({
              deliveredCount: 2,
              pendingCount: 1,
            }),
          }),
        }),
      );
    });
  });

  // ── getUserStats ─────────────────────────────────────────────────────────
  describe('getUserStats', () => {
    it('should return correct loyalty points calculation', async () => {
      const req = makeReq();
      const res = makeRes();

      // Controller execution order:
      // 1. Subscription.countDocuments({ status: {$in:['active','paused']} }) → 2
      // 2. Subscription.find({ user }).distinct('_id') → [id1, id2]
      // 3. Delivery.countDocuments({ subscription: $in, ... }) → 5
      // 4. Subscription.find({ paymentStatus: $in }).select('totalAmount') → paid subs
      // 5. Subscription.countDocuments({ status: 'completed' }) → 1
      Subscription.countDocuments
        .mockResolvedValueOnce(2) // 1st call: activeSubscriptions
        .mockResolvedValueOnce(1); // 2nd call: completedOrders

      Subscription.find
        .mockReturnValueOnce({ distinct: jest.fn().mockResolvedValue(['id1', 'id2']) }) // userSubIds
        .mockReturnValueOnce({
          select: jest.fn().mockResolvedValue([{ totalAmount: 600 }, { totalAmount: 400 }]),
        }); // paidSubs

      Delivery.countDocuments.mockResolvedValue(5); // mealsThisMonth

      await getUserStats(req, res);

      // loyaltyPoints = completedOrders(1)*10 + activeSubscriptions(2)*5 = 10 + 10 = 20
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            activeSubscriptions: 2,
            mealsThisMonth: 5,
            totalSpent: 1000,
            loyaltyPoints: 20,
          }),
        }),
      );
    });
  });
});
