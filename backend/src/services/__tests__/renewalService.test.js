const {
  renewSubscription,
  sendRenewalReminders,
  sweepExpiredSubscriptions,
} = require('../renewalService');
const Subscription = require('../../models/Subscription');
const subscriptionService = require('../subscriptionService');
const emailService = require('../emailService');
const socketService = require('../socketService');

jest.mock('../../models/Subscription');
jest.mock('../subscriptionService');
jest.mock('../emailService');
jest.mock('../socketService');

const DAY_MS = 24 * 60 * 60 * 1000;

describe('renewalService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('renewSubscription', () => {
    it('rejects when the source is not owned (404)', async () => {
      Subscription.findOne.mockResolvedValue(null);
      await expect(renewSubscription('sub1', 'user1')).rejects.toMatchObject({ status: 404 });
    });

    it('rejects renewing twice (409)', async () => {
      Subscription.findOne.mockResolvedValue({ renewedToSubscription: 'sub2' });
      await expect(renewSubscription('sub1', 'user1')).rejects.toMatchObject({ status: 409 });
    });

    it('creates a continuing subscription and links it back', async () => {
      const source = {
        _id: 'sub1',
        tiffin: 'tif1',
        plan: 'weekly',
        endDate: new Date(Date.now() + 3 * DAY_MS),
        deliveryAddress: { city: 'Bangalore' },
        deliveryTime: '1:00 PM',
        specialInstructions: '',
        renewedToSubscription: null,
        save: jest.fn().mockResolvedValue(true),
      };
      Subscription.findOne.mockResolvedValue(source);
      subscriptionService.createNewSubscription.mockResolvedValue({ _id: 'sub2' });

      const result = await renewSubscription('sub1', 'user1');

      expect(subscriptionService.createNewSubscription).toHaveBeenCalledWith(
        'user1',
        expect.objectContaining({ tiffinId: 'tif1', plan: 'weekly' }),
      );
      // new plan starts after the old one ends
      const passedStart = subscriptionService.createNewSubscription.mock.calls[0][1].startDate;
      expect(passedStart.getTime()).toBeGreaterThan(source.endDate.getTime());
      expect(source.renewedToSubscription).toBe('sub2');
      expect(source.save).toHaveBeenCalled();
      expect(result._id).toBe('sub2');
    });
  });

  describe('sendRenewalReminders', () => {
    it('marks each due subscription and sends one reminder (idempotent marker set first)', async () => {
      const sub = {
        _id: 'sub1',
        tiffin: { title: 'Veg Thali' },
        user: { _id: 'user1', email: 'a@b.in', name: 'A' },
        renewalReminderSentAt: null,
        save: jest.fn().mockResolvedValue(true),
      };
      Subscription.find.mockReturnValue({
        populate: () => ({ populate: () => Promise.resolve([sub]) }),
      });
      emailService.sendRenewalReminderEmail.mockResolvedValue(true);

      const result = await sendRenewalReminders();

      expect(sub.renewalReminderSentAt).toBeInstanceOf(Date);
      expect(sub.save).toHaveBeenCalled();
      expect(emailService.sendRenewalReminderEmail).toHaveBeenCalledWith(sub.user, sub);
      expect(socketService.emitNotification).toHaveBeenCalled();
      expect(result.sent).toBe(1);
    });

    it('queries only active, not-yet-reminded, not-yet-renewed subscriptions', async () => {
      Subscription.find.mockReturnValue({
        populate: () => ({ populate: () => Promise.resolve([]) }),
      });
      await sendRenewalReminders();
      const query = Subscription.find.mock.calls[0][0];
      expect(query.status).toBe('active');
      expect(query.renewalReminderSentAt).toBeNull();
      expect(query.renewedToSubscription).toBeNull();
      expect(query.endDate.$gte).toBeInstanceOf(Date);
      expect(query.endDate.$lte).toBeInstanceOf(Date);
    });
  });

  describe('sweepExpiredSubscriptions', () => {
    it('completes only active subscriptions whose endDate has passed', async () => {
      Subscription.updateMany.mockResolvedValue({ modifiedCount: 3 });

      const result = await sweepExpiredSubscriptions();

      const [filter, update] = Subscription.updateMany.mock.calls[0];
      expect(filter.status).toBe('active');
      expect(filter.endDate.$lt).toBeInstanceOf(Date);
      expect(update).toEqual({ $set: { status: 'completed' } });
      expect(result.completed).toBe(3);
    });

    it('reports zero when nothing is expired (idempotent re-run)', async () => {
      Subscription.updateMany.mockResolvedValue({ modifiedCount: 0 });

      const result = await sweepExpiredSubscriptions();

      expect(result.completed).toBe(0);
    });

    it('falls back to nModified for older mongoose driver responses', async () => {
      Subscription.updateMany.mockResolvedValue({ nModified: 2 });

      const result = await sweepExpiredSubscriptions();

      expect(result.completed).toBe(2);
    });
  });
});
