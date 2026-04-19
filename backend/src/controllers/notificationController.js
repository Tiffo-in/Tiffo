const {
    emitNotification,
    emitToUser,
    emitToPartner,
    emitToAdmins,
    emitOrderUpdate,
    emitNewOrder,
    emitPaymentNotification,
    emitDeliveryUpdate
} = require('../services/socketService');

/**
 * Send notification to a user
 */
const sendNotification = async (req, res) => {
    try {
        const { userId, title, message, type } = req.body;

        emitNotification(userId, {
            title,
            message,
            type: type || 'info'
        });

        res.json({
            success: true,
            message: 'Notification sent'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Notify partner of new order
 */
const notifyNewOrder = (partnerId, order) => {
    emitNewOrder(partnerId, {
        orderId: order._id,
        customerName: order.customer?.name || 'Customer',
        tiffinName: order.tiffin?.name || 'Tiffin',
        amount: order.amount,
        deliveryTime: order.deliveryTime,
        type: 'new_order'
    });

    // Also notify admins
    emitToAdmins('order:new', {
        orderId: order._id,
        partnerId,
        amount: order.amount
    });
};

/**
 * Notify customer of order status change
 */
const notifyOrderStatusChange = (customerId, orderId, status, partnerName) => {
    const statusMessages = {
        confirmed: 'Your order has been confirmed!',
        preparing: 'Your food is being prepared',
        out_for_delivery: 'Your order is out for delivery',
        delivered: 'Your order has been delivered!',
        cancelled: 'Your order has been cancelled'
    };

    emitNotification(customerId, {
        title: 'Order Update',
        message: statusMessages[status] || `Order status: ${status}`,
        type: status === 'cancelled' ? 'warning' : 'success',
        data: { orderId, status, partnerName }
    });

    emitOrderUpdate(orderId, status);
};

/**
 * Notify about delivery status
 */
const notifyDeliveryStatus = (deliveryId, customerId, partnerId, status, location = null) => {
    emitDeliveryUpdate(deliveryId, customerId, partnerId, status, {
        location,
        estimatedTime: status === 'out_for_delivery' ? '15-20 mins' : null
    });

    // Send user-friendly notification
    const statusMessages = {
        picked_up: '🚴 Your delivery has been picked up!',
        on_the_way: '🚀 Your food is on the way!',
        nearby: '📍 Delivery partner is nearby!',
        delivered: '✅ Your food has been delivered!'
    };

    if (statusMessages[status]) {
        emitNotification(customerId, {
            title: 'Delivery Update',
            message: statusMessages[status],
            type: 'info'
        });
    }
};

/**
 * Notify about payment status
 */
const notifyPaymentStatus = (userId, paymentData) => {
    emitPaymentNotification(userId, paymentData);

    const message = paymentData.status === 'success'
        ? `Payment of ₹${paymentData.amount} received!`
        : `Payment of ₹${paymentData.amount} failed`;

    emitNotification(userId, {
        title: paymentData.status === 'success' ? 'Payment Successful' : 'Payment Failed',
        message,
        type: paymentData.status === 'success' ? 'success' : 'error',
        data: paymentData
    });
};

/**
 * Notify partner about payment received
 */
const notifyPartnerPayment = (partnerId, paymentData) => {
    emitToPartner(partnerId, 'payment:received', paymentData);

    emitNotification(partnerId, {
        title: 'Payment Received',
        message: `You received ₹${paymentData.amount} from ${paymentData.customerName}`,
        type: 'success',
        data: paymentData
    });
};

/**
 * Notify about subscription events
 */
const notifySubscriptionEvent = (customerId, partnerId, event, subscriptionData) => {
    const events = {
        created: { title: 'Subscription Created', message: 'Your subscription is now active!' },
        renewed: { title: 'Subscription Renewed', message: 'Your subscription has been renewed' },
        paused: { title: 'Subscription Paused', message: 'Your subscription has been paused' },
        cancelled: { title: 'Subscription Cancelled', message: 'Your subscription has been cancelled' },
        expiring: { title: 'Subscription Expiring', message: 'Your subscription expires soon!' }
    };

    const eventInfo = events[event] || { title: 'Subscription Update', message: event };

    emitNotification(customerId, {
        ...eventInfo,
        type: event === 'cancelled' || event === 'expiring' ? 'warning' : 'info',
        data: subscriptionData
    });

    // Notify partner too
    if (partnerId) {
        emitToPartner(partnerId, 'subscription:update', {
            event,
            customerId,
            ...subscriptionData
        });
    }
};

module.exports = {
    sendNotification,
    notifyNewOrder,
    notifyOrderStatusChange,
    notifyDeliveryStatus,
    notifyPaymentStatus,
    notifyPartnerPayment,
    notifySubscriptionEvent
};
