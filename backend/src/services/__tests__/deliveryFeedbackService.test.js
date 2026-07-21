const { submitFeedback, reportIssue } = require('../deliveryFeedbackService');
const Delivery = require('../../models/Delivery');

jest.mock('../../models/Delivery');

const makeDelivery = (over = {}) => ({
  _id: 'del1',
  user: 'user1',
  status: 'delivered',
  save: jest.fn().mockResolvedValue(true),
  ...over,
});

describe('deliveryFeedbackService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('submitFeedback', () => {
    it('rejects an out-of-range rating (400)', async () => {
      await expect(submitFeedback('del1', 'user1', { rating: 9 })).rejects.toMatchObject({
        status: 400,
      });
      expect(Delivery.findOne).not.toHaveBeenCalled();
    });

    it('rejects feedback on a non-delivered meal (400)', async () => {
      Delivery.findOne.mockResolvedValue(makeDelivery({ status: 'scheduled' }));
      await expect(submitFeedback('del1', 'user1', { rating: 5 })).rejects.toMatchObject({
        status: 400,
      });
    });

    it('stores rating, trimmed comment, and caps images at 5', async () => {
      const delivery = makeDelivery();
      Delivery.findOne.mockResolvedValue(delivery);

      const fb = await submitFeedback('del1', 'user1', {
        rating: 4,
        comment: '  tasty  ',
        images: ['a', 'b', 'c', 'd', 'e', 'f'],
      });

      expect(fb.rating).toBe(4);
      expect(fb.comment).toBe('tasty');
      expect(fb.images).toHaveLength(5);
      expect(fb.submittedAt).toBeInstanceOf(Date);
      expect(delivery.save).toHaveBeenCalled();
    });
  });

  describe('reportIssue', () => {
    it('rejects an invalid reason (400)', async () => {
      await expect(reportIssue('del1', 'user1', { reason: 'nonsense' })).rejects.toMatchObject({
        status: 400,
      });
    });

    it('rejects reporting a scheduled/skipped delivery (400)', async () => {
      Delivery.findOne.mockResolvedValue(makeDelivery({ status: 'skipped' }));
      await expect(reportIssue('del1', 'user1', { reason: 'not_delivered' })).rejects.toMatchObject(
        { status: 400 },
      );
    });

    it('rejects a second open report (409)', async () => {
      Delivery.findOne.mockResolvedValue(makeDelivery({ report: { status: 'open' } }));
      await expect(reportIssue('del1', 'user1', { reason: 'late' })).rejects.toMatchObject({
        status: 409,
      });
    });

    it('opens a report on a delivered meal', async () => {
      const delivery = makeDelivery();
      Delivery.findOne.mockResolvedValue(delivery);

      const report = await reportIssue('del1', 'user1', { reason: 'quality', comment: ' cold ' });

      expect(report.reason).toBe('quality');
      expect(report.comment).toBe('cold');
      expect(report.status).toBe('open');
      expect(delivery.save).toHaveBeenCalled();
    });
  });
});
