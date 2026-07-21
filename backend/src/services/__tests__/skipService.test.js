const mongoose = require('mongoose');
const { skipDelivery, MAX_SKIPS_PER_MONTH } = require('../skipService');
const Delivery = require('../../models/Delivery');
const Subscription = require('../../models/Subscription');

jest.mock('../../models/Delivery');
jest.mock('../../models/Subscription');

const DAY_MS = 24 * 60 * 60 * 1000;

const makeDelivery = (over = {}) => ({
  _id: 'del1',
  user: 'user1',
  subscription: 'sub1',
  partner: 'partner1',
  status: 'scheduled',
  deliveryDate: new Date(Date.now() + 6 * DAY_MS), // well past the cutoff
  deliveryTime: '1:00 PM',
  deliveryAddress: { city: 'Bangalore' },
  mealType: 'lunch',
  save: jest.fn().mockResolvedValue(true),
  ...over,
});

const mockCount = (n) =>
  Delivery.countDocuments.mockReturnValue({ session: () => Promise.resolve(n) });

const mockSubscription = () =>
  Subscription.findById.mockReturnValue({
    populate: () => ({
      populate: () =>
        Promise.resolve({
          _id: 'sub1',
          endDate: new Date(Date.now() + 10 * DAY_MS),
          partner: { businessHours: {} },
          tiffin: { mealType: 'lunch' },
          save: jest.fn().mockResolvedValue(true),
        }),
    }),
  });

beforeAll(() => {
  mongoose.startSession = jest.fn().mockResolvedValue({
    withTransaction: async (cb) => cb(),
    endSession: jest.fn(),
  });
});

describe('skipService.skipDelivery', () => {
  afterEach(() => jest.clearAllMocks());

  it('rejects a delivery the caller does not own (404)', async () => {
    Delivery.findOne.mockResolvedValue(null);
    await expect(skipDelivery('del1', 'user1')).rejects.toMatchObject({ status: 404 });
  });

  it('rejects a non-scheduled delivery (400)', async () => {
    Delivery.findOne.mockResolvedValue(makeDelivery({ status: 'delivered' }));
    await expect(skipDelivery('del1', 'user1')).rejects.toMatchObject({ status: 400 });
  });

  it('rejects when the cutoff has passed (delivery is today) (400)', async () => {
    Delivery.findOne.mockResolvedValue(makeDelivery({ deliveryDate: new Date() }));
    await expect(skipDelivery('del1', 'user1')).rejects.toMatchObject({ status: 400 });
  });

  it('rejects when the monthly skip cap is reached (400)', async () => {
    Delivery.findOne.mockResolvedValue(makeDelivery());
    mockCount(MAX_SKIPS_PER_MONTH);
    await expect(skipDelivery('del1', 'user1')).rejects.toMatchObject({ status: 400 });
  });

  it('skips: marks skipped, creates a make-up day, and returns remaining skips', async () => {
    const delivery = makeDelivery();
    Delivery.findOne.mockResolvedValue(delivery);
    mockCount(1);
    mockSubscription();
    Delivery.create.mockResolvedValue([{ _id: 'makeup1', status: 'scheduled' }]);

    const result = await skipDelivery('del1', 'user1');

    expect(delivery.status).toBe('skipped');
    expect(delivery.skippedAt).toBeInstanceOf(Date);
    expect(delivery.save).toHaveBeenCalled();
    expect(Delivery.create).toHaveBeenCalled();
    const created = Delivery.create.mock.calls[0][0][0];
    expect(created.makeupForDelivery).toBe('del1');
    expect(created.status).toBe('scheduled');
    expect(result.skipsUsed).toBe(2);
    expect(result.skipsRemaining).toBe(MAX_SKIPS_PER_MONTH - 2);
  });
});
