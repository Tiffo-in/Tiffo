const User = require('../models/User');
const Partner = require('../models/Partner');
const Subscription = require('../models/Subscription');
const PaymentLog = require('../models/PaymentLog');
const {
  createLinkedAccount,
  addBankAccount,
  createOrderWithTransfer,
  verifyPaymentSignature,
  createRefund,
} = require('./razorpayService');
const { generateDeliveriesForSubscription } = require('./deliveryService');
const { emitNotification } = require('./socketService');

exports.setupPartnerPaymentAccount = async (
  partnerId,
  { businessName, bankDetails, taxDetails },
) => {
  // Get user for personal details (email, phone, address)
  const user = await User.findById(partnerId);
  // Get partner business context
  const partner = await Partner.findOne({ user: partnerId }).populate('user');

  if (!user || user.role !== 'partner' || !partner) {
    throw new Error('Only partners can setup payment accounts');
  }

  // Check if account already exists
  if (partner.razorpayAccountId) {
    throw new Error('Razorpay account already exists');
  }

  // Create Razorpay linked account
  const accountResult = await createLinkedAccount({
    email: user.email,
    phone: user.phone,
    name: user.name,
    businessName,
    address: user.address || partner.address,
    pan: taxDetails.pan,
  });

  if (!accountResult.success) {
    throw new Error(`Failed to create Razorpay account: ${accountResult.error}`);
  }

  // Add bank account to linked account
  const bankResult = await addBankAccount(accountResult.accountId, bankDetails);

  if (!bankResult.success) {
    throw new Error(`Failed to add bank account: ${bankResult.error}`);
  }

  // Update partner record (not user)
  partner.razorpayAccountId = accountResult.accountId;
  partner.bankDetails = {
    accountNumber: bankDetails.accountNumber,
    ifscCode: bankDetails.ifscCode,
    accountHolderName: bankDetails.accountHolderName,
    verified: false,
  };
  partner.documents = {
    ...partner.documents,
    pan: taxDetails.pan,
    gst: taxDetails.gst,
  };
  partner.payoutEnabled = true;

  await partner.save();
  return accountResult.accountId;
};

exports.createSubscriptionOrder = async (userId, subscriptionId) => {
  const subscription = await Subscription.findById(subscriptionId)
    .populate('partner')
    .populate('tiffin');

  if (!subscription) {
    const error = new Error('Subscription not found');
    error.status = 404;
    throw error;
  }

  if (subscription.user.toString() !== userId) {
    const error = new Error('Unauthorized');
    error.status = 403;
    throw error;
  }

  if (subscription.paymentStatus === 'paid' || subscription.paymentStatus === 'captured') {
    throw new Error('Subscription already paid');
  }

  if (!subscription.partner.razorpayAccountId) {
    throw new Error('Partner payment account not setup');
  }

  const totalAmount = subscription.grandTotal || subscription.totalAmount;
  const commissionRate = subscription.partner.commissionRate || 0.1;
  const platformCommission = Math.round(totalAmount * commissionRate);
  const providerAmount = totalAmount - platformCommission;

  const orderResult = await createOrderWithTransfer({
    amount: totalAmount,
    currency: 'INR',
    receipt: `sub_${subscriptionId}`,
    partnerAccountId: subscription.partner.razorpayAccountId,
    providerAmount: providerAmount,
    metadata: {
      subscription_id: subscriptionId,
      partner_id: subscription.partner._id.toString(),
      user_id: userId,
    },
  });

  if (!orderResult.success) {
    throw new Error(`Failed to create order: ${orderResult.error}`);
  }

  subscription.orderId = orderResult.orderId;
  subscription.platformCommission = platformCommission;
  subscription.providerAmount = providerAmount;
  await subscription.save();

  await PaymentLog.create({
    type: 'payment',
    status: 'pending',
    orderId: orderResult.orderId,
    amount: totalAmount,
    currency: 'INR',
    subscriptionId: subscriptionId,
    userId: userId,
    partnerId: subscription.partner._id,
    metadata: {
      platformCommission,
      providerAmount,
    },
  });

  return {
    orderId: orderResult.orderId,
    amount: totalAmount * 100, // in paise
    currency: 'INR',
  };
};

exports.verifySubscriptionPayment = async ({
  razorpay_payment_id,
  razorpay_order_id,
  razorpay_signature,
  subscriptionId,
}) => {
  const isValid = verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  );

  if (!isValid) {
    await PaymentLog.create({
      type: 'payment',
      status: 'failed',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      subscriptionId: subscriptionId,
      errorCode: 'SIGNATURE_MISMATCH',
      errorDescription: 'Payment signature verification failed',
      failedAt: new Date(),
    });
    throw new Error('Invalid payment signature');
  }

  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    const error = new Error('Subscription not found');
    error.status = 404;
    throw error;
  }

  subscription.paymentId = razorpay_payment_id;
  subscription.razorpaySignature = razorpay_signature;
  subscription.paymentStatus = 'paid';
  subscription.status = 'active';
  subscription.paidAt = new Date();
  await subscription.save();

  const populatedForDeliveries = await Subscription.findById(subscription._id).populate(
    'tiffin partner',
  );
  if (populatedForDeliveries) {
    await generateDeliveriesForSubscription(populatedForDeliveries);
    if (populatedForDeliveries.user) {
      emitNotification(populatedForDeliveries.user._id, {
        title: 'Subscription Active 🎉',
        message: `Your ${populatedForDeliveries.tiffin.title} subscription is active. Your meal calendar has been updated!`,
        type: 'success',
      });
    }
  }

  await PaymentLog.findOneAndUpdate(
    { orderId: razorpay_order_id },
    {
      status: 'success',
      paymentId: razorpay_payment_id,
      processedAt: new Date(),
    },
  );

  return subscription;
};

exports.confirmCod = async (subscriptionId) => {
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    const error = new Error('Subscription not found');
    error.status = 404;
    throw error;
  }

  subscription.paymentMethod = 'cod';
  subscription.paymentStatus = 'pending';
  subscription.status = 'active';
  await subscription.save();

  const populatedForDeliveries = await Subscription.findById(subscription._id).populate(
    'tiffin partner',
  );
  if (populatedForDeliveries) {
    await generateDeliveriesForSubscription(populatedForDeliveries);
    if (populatedForDeliveries.user) {
      emitNotification(populatedForDeliveries.user._id, {
        title: 'Order Confirmed (COD) 🎉',
        message: `Your ${populatedForDeliveries.tiffin.title} subscription is active. Pay cash upon first delivery!`,
        type: 'success',
      });
    }
  }

  return subscription;
};

exports.processRefundForSubscription = async (subscriptionId, amount, reason) => {
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    const error = new Error('Subscription not found');
    error.status = 404;
    throw error;
  }

  if (!subscription.paymentId) {
    throw new Error('No payment found for this subscription');
  }

  const refundResult = await createRefund(subscription.paymentId, amount, {
    reason,
    subscription_id: subscriptionId,
  });

  if (!refundResult.success) {
    throw new Error(`Refund failed: ${refundResult.error}`);
  }

  subscription.paymentStatus = 'refunded';
  subscription.status = 'cancelled';
  await subscription.save();

  await PaymentLog.create({
    type: 'refund',
    status: 'success',
    paymentId: subscription.paymentId,
    refundId: refundResult.refundId,
    amount: amount || subscription.totalAmount,
    subscriptionId: subscriptionId,
    metadata: { reason },
    processedAt: new Date(),
  });

  return refundResult.refundId;
};

exports.fetchPaymentHistory = async (userId, { type, status, limit = 20, page = 1 }) => {
  const query = { userId };
  if (type) query.type = type;
  if (status) query.status = status;

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);

  const safeLimit = Math.max(1, isNaN(parsedLimit) ? 20 : parsedLimit);
  const safePage = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage);

  const payments = await PaymentLog.find(query)
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .skip((safePage - 1) * safeLimit)
    .populate('subscriptionId', 'plan startDate endDate')
    .populate('partnerId', 'name email');

  const total = await PaymentLog.countDocuments(query);

  // Calculate global summary stats for the user (ignoring pagination filters)
  const allPayments = await PaymentLog.find({ userId });
  const successful = allPayments.filter((p) => p.status === 'success' && p.type !== 'refund');
  const refunded = allPayments.filter((p) => p.type === 'refund');
  const failed = allPayments.filter((p) => p.status === 'failed');
  const totalSpent = successful.reduce((sum, p) => sum + (p.amount || 0), 0);

  const summaryStats = {
    totalSpent,
    totalTransactions: successful.length,
    totalRefunds: refunded.length,
    totalFailed: failed.length,
  };

  return {
    payments,
    summaryStats,
    pagination: {
      total,
      page: safePage,
      pages: Math.ceil(total / safeLimit),
    },
  };
};
