const { fetchSubscriptionDeliveries, fetchTodayDeliveries } = require('../subscriptionService');
const Subscription = require('../../models/Subscription');
const Delivery = require('../../models/Delivery');

jest.mock('../../models/Subscription');
jest.mock('../../models/Delivery');

// Build a chainable Mongoose-query mock whose terminal (lean or awaited) resolves to `result`.
const chain = (result) => {
  const q = {};
  for (const m of ['sort', 'skip', 'limit', 'populate']) q[m] = jest.fn(() => q);
  q.lean = jest.fn().mockResolvedValue(result);
  q.then = (resolve) => resolve(result); // awaitable without .lean()
  return q;
};

describe('subscriptionService — Phase 1 delivery reads', () => {
  afterEach(() => jest.clearAllMocks());

  describe('fetchSubscriptionDeliveries', () => {
    it('throws 404 when the subscription is not owned by the caller', async () => {
      Subscription.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

      await expect(fetchSubscriptionDeliveries('sub1', 'user1')).rejects.toMatchObject({
        status: 404,
      });
      expect(Subscription.findOne).toHaveBeenCalledWith({ _id: 'sub1', user: 'user1' });
    });

    it('returns deliveries with pagination for the owner', async () => {
      Subscription.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'sub1' }),
      });
      Delivery.find.mockReturnValue(chain([{ _id: 'd1', status: 'scheduled' }]));
      Delivery.countDocuments.mockResolvedValue(1);

      const result = await fetchSubscriptionDeliveries('sub1', 'user1', { page: 1, limit: 31 });

      expect(result.deliveries).toHaveLength(1);
      expect(result.pagination).toMatchObject({ page: 1, limit: 31, total: 1, pages: 1 });
    });

    it('clamps out-of-range pagination inputs', async () => {
      Subscription.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'sub1' }),
      });
      const q = chain([]);
      Delivery.find.mockReturnValue(q);
      Delivery.countDocuments.mockResolvedValue(0);

      const result = await fetchSubscriptionDeliveries('sub1', 'user1', { page: -5, limit: 9999 });

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(100); // capped
    });
  });

  describe('fetchTodayDeliveries', () => {
    it('queries the caller today (IST date range) and returns deliveries', async () => {
      Delivery.find.mockReturnValue(chain([{ _id: 'd1' }]));

      const result = await fetchTodayDeliveries('user1');

      expect(result).toHaveLength(1);
      const query = Delivery.find.mock.calls[0][0];
      expect(query.user).toBe('user1');
      expect(query.deliveryDate.$gte).toBeInstanceOf(Date);
      expect(query.deliveryDate.$lte).toBeInstanceOf(Date);
      // Range spans exactly one day.
      const spanMs = query.deliveryDate.$lte - query.deliveryDate.$gte;
      expect(spanMs).toBeGreaterThan(23 * 3600 * 1000);
      expect(spanMs).toBeLessThan(24 * 3600 * 1000);
    });
  });
});
