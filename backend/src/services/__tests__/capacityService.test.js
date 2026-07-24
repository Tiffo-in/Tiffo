const {
  assertCapacityForActivation,
  syncCurrentOrders,
  countOccupyingSubscriptions,
} = require('../capacityService');
const Subscription = require('../../models/Subscription');
const Tiffin = require('../../models/Tiffin');

jest.mock('../../models/Subscription');
jest.mock('../../models/Tiffin');

// countDocuments(...).session(...) resolves to a number.
const mockOccupancyCount = (count) => {
  Subscription.countDocuments.mockReturnValue({
    session: jest.fn().mockResolvedValue(count),
  });
};

describe('capacityService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('assertCapacityForActivation', () => {
    it('allows activation when below the cap', async () => {
      mockOccupancyCount(49);
      await expect(
        assertCapacityForActivation({ _id: 't1', availability: { maxOrders: 50 } }),
      ).resolves.toBeUndefined();
    });

    it('throws 409 when the tiffin is at capacity', async () => {
      mockOccupancyCount(50);
      await expect(
        assertCapacityForActivation({ _id: 't1', availability: { maxOrders: 50 } }),
      ).rejects.toMatchObject({ status: 409 });
    });

    it('treats maxOrders of 0 as uncapped and never counts', async () => {
      await assertCapacityForActivation({ _id: 't1', availability: { maxOrders: 0 } });
      expect(Subscription.countDocuments).not.toHaveBeenCalled();
    });

    it('is a no-op when the tiffin is not populated', async () => {
      await assertCapacityForActivation(undefined);
      expect(Subscription.countDocuments).not.toHaveBeenCalled();
    });

    it('skips the check for an idempotent re-activation', async () => {
      await assertCapacityForActivation(
        { _id: 't1', availability: { maxOrders: 1 } },
        { skip: true },
      );
      expect(Subscription.countDocuments).not.toHaveBeenCalled();
    });

    it('counts only running, non-expired subscriptions for this tiffin', async () => {
      mockOccupancyCount(0);
      await assertCapacityForActivation({ _id: 't1', availability: { maxOrders: 5 } });
      const query = Subscription.countDocuments.mock.calls[0][0];
      expect(query.tiffin).toBe('t1');
      expect(query.status).toEqual({ $in: ['active', 'paused'] });
      expect(query.endDate).toHaveProperty('$gte');
    });
  });

  describe('syncCurrentOrders', () => {
    it('persists the live count into availability.currentOrders', async () => {
      mockOccupancyCount(7);
      Tiffin.updateOne.mockResolvedValue({});
      const result = await syncCurrentOrders({ _id: 't1' });
      expect(result).toBe(7);
      expect(Tiffin.updateOne).toHaveBeenCalledWith(
        { _id: 't1' },
        { $set: { 'availability.currentOrders': 7 } },
        {},
      );
    });

    it('accepts a bare ObjectId (unpopulated tiffin) and returns 0 when absent', async () => {
      const result = await syncCurrentOrders(null);
      expect(result).toBe(0);
      expect(Tiffin.updateOne).not.toHaveBeenCalled();
    });
  });

  describe('countOccupyingSubscriptions', () => {
    it('passes the session through to the query', async () => {
      const session = { id: 'sess' };
      const sessionFn = jest.fn().mockResolvedValue(3);
      Subscription.countDocuments.mockReturnValue({ session: sessionFn });
      const count = await countOccupyingSubscriptions('t1', session);
      expect(count).toBe(3);
      expect(sessionFn).toHaveBeenCalledWith(session);
    });
  });
});
