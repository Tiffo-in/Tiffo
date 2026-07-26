const crypto = require('crypto');

const { handleRazorpayWebhook } = require('../webhookController');
const Subscription = require('../../models/Subscription');
const PaymentLog = require('../../models/PaymentLog');
const {
  sendPaymentFailure,
  sendPartnerPaymentNotification,
  sendAdminTransferFailureAlert,
} = require('../../services/emailService');

jest.mock('../../models/Subscription');
jest.mock('../../models/PaymentLog');
jest.mock('../../services/emailService');
jest.mock('../../services/deliveryService');
jest.mock('../../services/capacityService');
jest.mock('../../services/socketService');
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const WEBHOOK_SECRET = 'test_webhook_secret';

const buildRequest = (payload) => {
  const raw = Buffer.from(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(raw).digest('hex');
  return { body: raw, headers: { 'x-razorpay-signature': signature } };
};

const buildResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('handleRazorpayWebhook - payment.failed', () => {
  const failedPayload = {
    event: 'payment.failed',
    payload: {
      payment: {
        entity: {
          id: 'pay_failed_1',
          order_id: 'order_1',
          amount: 250000,
          currency: 'INR',
          error_code: 'BAD_REQUEST_ERROR',
          error_description: 'Card declined',
        },
      },
    },
  };

  beforeEach(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
    sendPaymentFailure.mockResolvedValue(true);
  });

  it('records the failure against the subscription owner so it shows in payment history', async () => {
    const subscription = {
      _id: 'sub_1',
      user: 'user_owner',
      partner: 'partner_1',
      orderId: 'order_1',
      paymentStatus: 'pending',
      save: jest.fn().mockResolvedValue(true),
    };
    Subscription.findOne.mockResolvedValue(subscription);
    Subscription.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ _id: 'sub_1', user: { _id: 'user_owner' } }),
    });
    PaymentLog.create.mockResolvedValue({});

    const res = buildResponse();
    await handleRazorpayWebhook(buildRequest(failedPayload), res);

    expect(res.json).toHaveBeenCalledWith({ status: 'ok' });
    expect(subscription.save).toHaveBeenCalled();
    expect(subscription.paymentStatus).toBe('failed');
    expect(PaymentLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'payment',
        status: 'failed',
        orderId: 'order_1',
        paymentId: 'pay_failed_1',
        subscriptionId: 'sub_1',
        userId: 'user_owner',
        partnerId: 'partner_1',
        amount: 2500,
      }),
    );
  });

  it('still logs the failure when no subscription matches the order', async () => {
    Subscription.findOne.mockResolvedValue(null);
    PaymentLog.create.mockResolvedValue({});

    const res = buildResponse();
    await handleRazorpayWebhook(buildRequest(failedPayload), res);

    expect(res.json).toHaveBeenCalledWith({ status: 'ok' });
    expect(PaymentLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed',
        userId: undefined,
        partnerId: undefined,
      }),
    );
  });

  it('rejects a payload whose signature does not match', async () => {
    const res = buildResponse();
    await handleRazorpayWebhook(
      {
        body: Buffer.from(JSON.stringify(failedPayload)),
        headers: { 'x-razorpay-signature': 'nope' },
      },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid signature' });
    expect(PaymentLog.create).not.toHaveBeenCalled();
  });
});

describe('handleRazorpayWebhook - transfer legs', () => {
  const transferEntity = {
    id: 'trf_1',
    source: 'order_1',
    recipient: 'acc_partner_1',
    amount: 225000,
    currency: 'INR',
    error: { code: 'PAYOUT_ERROR', description: 'Account frozen' },
  };

  let subscription;

  beforeEach(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
    subscription = {
      _id: 'sub_1',
      user: 'user_owner',
      partner: 'partner_1',
      save: jest.fn().mockResolvedValue(true),
    };
    Subscription.findOne.mockResolvedValue(subscription);
    PaymentLog.create.mockResolvedValue({});
  });

  // A payout is partner-side money movement. It carries `partnerId` so payouts
  // can be reconciled per kitchen, but never `userId`: fetchPaymentHistory sums
  // every non-refund `success` row into the customer's totalSpent, so a payout
  // tagged with the buyer would double-count their subscription payment.
  it('tags a processed transfer with the partner and not the customer', async () => {
    Subscription.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ _id: 'sub_1', partner: { _id: 'partner_1' } }),
    });
    sendPartnerPaymentNotification.mockResolvedValue(true);

    const res = buildResponse();
    await handleRazorpayWebhook(
      buildRequest({
        event: 'transfer.processed',
        payload: { transfer: { entity: transferEntity } },
      }),
      res,
    );

    expect(res.json).toHaveBeenCalledWith({ status: 'ok' });
    const logged = PaymentLog.create.mock.calls[0][0];
    expect(logged).toMatchObject({
      type: 'transfer',
      status: 'success',
      partnerId: 'partner_1',
      amount: 2250,
    });
    expect(logged.userId).toBeUndefined();
  });

  it('tags a failed transfer with the partner and not the customer', async () => {
    sendAdminTransferFailureAlert.mockResolvedValue(true);

    const res = buildResponse();
    await handleRazorpayWebhook(
      buildRequest({
        event: 'transfer.failed',
        payload: { transfer: { entity: transferEntity } },
      }),
      res,
    );

    expect(res.json).toHaveBeenCalledWith({ status: 'ok' });
    const logged = PaymentLog.create.mock.calls[0][0];
    expect(logged).toMatchObject({
      type: 'transfer',
      status: 'failed',
      partnerId: 'partner_1',
      errorCode: 'PAYOUT_ERROR',
    });
    expect(logged.userId).toBeUndefined();
  });
});
