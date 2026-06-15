const { resumeUserSubscription } = require('../subscriptionService');
const Subscription = require('../../models/Subscription');

jest.mock('../../models/Subscription');

describe('Subscription Service - resumeUserSubscription', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw 404 error if subscription is not found', async () => {
    Subscription.findOne.mockResolvedValue(null);

    await expect(resumeUserSubscription('sub123', 'user123')).rejects.toMatchObject({
      message: 'Subscription not found',
      status: 404,
    });

    expect(Subscription.findOne).toHaveBeenCalledWith({
      _id: 'sub123',
      user: 'user123',
    });
  });

  it('should throw 400 error if subscription is not paused', async () => {
    const activeSub = { status: 'active' };
    Subscription.findOne.mockResolvedValue(activeSub);

    await expect(resumeUserSubscription('sub123', 'user123')).rejects.toMatchObject({
      message: 'Only paused subscriptions can be resumed',
      status: 400,
    });
  });

  it('should resume subscription successfully', async () => {
    const pausedSub = {
      status: 'paused',
      save: jest.fn().mockResolvedValue(true),
    };
    Subscription.findOne.mockResolvedValue(pausedSub);

    const result = await resumeUserSubscription('sub123', 'user123');

    expect(result.status).toBe('active');
    expect(pausedSub.save).toHaveBeenCalled();
  });
});
