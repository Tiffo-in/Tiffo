const { Resend } = require('resend');
const logger = require('../utils/logger');

// Resend instance
let resendInstance = null;

/**
 * Initialize email service with Resend
 */
const initializeEmailService = () => {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      logger.warn('RESEND_API_KEY is not defined in env variables');
      return null;
    }
    resendInstance = new Resend(apiKey);
    logger.info('Resend email service initialized');
    return resendInstance;
  } catch (error) {
    logger.error('Resend email service initialization failed:', { stack: error.stack });
    return null;
  }
};

/**
 * Send email helper using Resend
 */
const sendEmail = async (to, subject, html, text) => {
  try {
    if (!resendInstance) {
      logger.warn('Resend email service not initialized, skipping email send');
      return { success: false, message: 'Email service not configured' };
    }

    const from = process.env.EMAIL_FROM || 'TIFFO <noreply@tiffo.in>';

    const response = await resendInstance.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (response.error) {
      logger.error(`Error sending email to ${to}: ${response.error.message}`);
      return { success: false, error: response.error.message };
    }

    const messageId = response.data ? response.data.id : 'unknown';
    logger.info(`Email sent via Resend to ${to}: ${messageId}`);
    return { success: true, messageId };
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Payment confirmation email
 */
const sendPaymentConfirmation = async (user, subscription, payment) => {
  const subject = '✅ Payment Confirmed - TIFFO Subscription';

  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                .label { font-weight: bold; color: #6b7280; }
                .value { color: #111827; }
                .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🍛 TIFFO</h1>
                    <h2>Payment Confirmed!</h2>
                </div>
                <div class="content">
                    <div class="success-badge">✅ Payment Successful</div>
                    
                    <h3>Hello ${user.name},</h3>
                    <p>Your payment has been successfully processed. Your tiffin subscription is now active!</p>
                    
                    <h4>Payment Details:</h4>
                    <div class="detail-row">
                        <span class="label">Amount Paid:</span>
                        <span class="value">₹${subscription.totalAmount}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Payment ID:</span>
                        <span class="value">${payment.paymentId || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Order ID:</span>
                        <span class="value">${subscription.orderId}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Subscription Plan:</span>
                        <span class="value">${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Start Date:</span>
                        <span class="value">${new Date(subscription.startDate).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">End Date:</span>
                        <span class="value">${new Date(subscription.endDate).toLocaleDateString()}</span>
                    </div>
                    
                    <p style="margin-top: 20px;">Your delicious tiffin meals will be delivered at <strong>${subscription.deliveryTime}</strong>.</p>
                    
                    <p>Thank you for choosing TIFFO! 🎉</p>
                </div>
                <div class="footer">
                    <p>Questions? Contact us at support@tiffo.com</p>
                    <p>&copy; ${new Date().getFullYear()} TIFFO. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

  const text = `
Payment Confirmed - TIFFO

Hello ${user.name},

Your payment has been successfully processed. Your tiffin subscription is now active!

Payment Details:
- Amount Paid: ₹${subscription.totalAmount}
- Payment ID: ${payment.paymentId || 'N/A'}
- Order ID: ${subscription.orderId}
- Plan: ${subscription.plan}
- Start Date: ${new Date(subscription.startDate).toLocaleDateString()}
- End Date: ${new Date(subscription.endDate).toLocaleDateString()}

Your tiffin will be delivered at ${subscription.deliveryTime}.

Thank you for choosing TIFFO!

Questions? Contact us at support@tiffo.com
    `;

  return await sendEmail(user.email, subject, html, text);
};

/**
 * Payment failure notification
 */
const sendPaymentFailure = async (user, subscription, errorDetails) => {
  const subject = '❌ Payment Failed - TIFFO Subscription';

  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .error-badge { background: #ef4444; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 20px 0; }
                .retry-button { background: #7f1d1d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🍛 TIFFO</h1>
                    <h2>Payment Failed</h2>
                </div>
                <div class="content">
                    <div class="error-badge">❌ Payment Unsuccessful</div>
                    
                    <h3>Hello ${user.name},</h3>
                    <p>We encountered an issue while processing your payment for the tiffin subscription.</p>
                    
                    <p><strong>Error:</strong> ${errorDetails.errorDescription || 'Payment processing failed'}</p>
                    
                    <p>Don't worry! You can retry the payment or try a different payment method.</p>
                    
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/${subscription._id}" class="retry-button">Retry Payment</a>
                    
                    <h4>Payment Details:</h4>
                    <p>Amount: ₹${subscription.totalAmount}</p>
                    <p>Order ID: ${subscription.orderId}</p>
                    
                    <p style="margin-top: 20px;">If you continue to face issues, please contact our support team.</p>
                </div>
                <div class="footer">
                    <p>Need help? Contact us at support@tiffo.com</p>
                    <p>&copy; ${new Date().getFullYear()} TIFFO. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

  const text = `
Payment Failed - TIFFO

Hello ${user.name},

We encountered an issue while processing your payment for the tiffin subscription.

Error: ${errorDetails.errorDescription || 'Payment processing failed'}

Amount: ₹${subscription.totalAmount}
Order ID: ${subscription.orderId}

You can retry the payment at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/${subscription._id}

Need help? Contact us at support@tiffo.com
    `;

  return await sendEmail(user.email, subject, html, text);
};

/**
 * Partner payment notification
 */
const sendPartnerPaymentNotification = async (partner, subscription, transferAmount) => {
  const subject = '💰 Payment Received - TIFFO';

  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .amount { font-size: 36px; font-weight: bold; color: #059669; text-align: center; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🍛 TIFFO</h1>
                    <h2>Payment Received!</h2>
                </div>
                <div class="content">
                    <h3>Hello ${partner.businessName || partner.name},</h3>
                    <p>Great news! You've received a payment from a customer subscription.</p>
                    
                    <div class="amount">₹${transferAmount}</div>
                    
                    <h4>Transaction Details:</h4>
                    <p>Order ID: ${subscription.orderId}</p>
                    <p>Transfer ID: ${subscription.transferId || 'Processing'}</p>
                    <p>Date: ${new Date().toLocaleDateString()}</p>
                    
                    <p>The amount has been transferred to your registered bank account.</p>
                    
                    <p>Keep up the great work! 👨‍🍳</p>
                </div>
                <div class="footer">
                    <p>View earnings: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/partner/earnings</p>
                    <p>&copy; ${new Date().getFullYear()} TIFFO. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

  const text = `
Payment Received - TIFFO

Hello ${partner.businessName || partner.name},

You've received a payment: ₹${transferAmount}

Transaction Details:
- Order ID: ${subscription.orderId}
- Transfer ID: ${subscription.transferId || 'Processing'}
- Date: ${new Date().toLocaleDateString()}

View earnings: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/partner/earnings
    `;

  return await sendEmail(partner.email, subject, html, text);
};

/**
 * Admin transfer failure alert
 */
const sendAdminTransferFailureAlert = async (subscription, errorDetails) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@tiffo.com';
  const subject = '⚠️ Transfer Failed - Action Required';

  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⚠️ TIFFO Admin Alert</h1>
                    <h2>Transfer Failed</h2>
                </div>
                <div class="content">
                    <div class="alert">
                        <strong>Action Required:</strong> A payment transfer to partner has failed.
                    </div>
                    
                    <h3>Transfer Details:</h3>
                    <p><strong>Subscription ID:</strong> ${subscription._id}</p>
                    <p><strong>Order ID:</strong> ${subscription.orderId}</p>
                    <p><strong>Amount:</strong> ₹${subscription.providerAmount}</p>
                    <p><strong>Partner ID:</strong> ${subscription.partner}</p>
                    <p><strong>Error:</strong> ${errorDetails.errorDescription || 'Unknown error'}</p>
                    
                    <p>Please investigate and retry the transfer manually.</p>
                    
                    <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/payments">View in Admin Dashboard</a></p>
                </div>
            </div>
        </body>
        </html>
    `;

  const text = `
TIFFO Admin Alert - Transfer Failed

A payment transfer to partner has failed.

Subscription ID: ${subscription._id}
Order ID: ${subscription.orderId}
Amount: ₹${subscription.providerAmount}
Partner ID: ${subscription.partner}
Error: ${errorDetails.errorDescription || 'Unknown error'}

Please investigate and retry the transfer manually.
    `;

  return await sendEmail(adminEmail, subject, html, text);
};

/**
 * Refund confirmation email
 */
const sendRefundConfirmation = async (user, subscription, refundAmount) => {
  const subject = '💳 Refund Processed - TIFFO';

  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .refund-badge { background: #3b82f6; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🍛 TIFFO</h1>
                    <h2>Refund Processed</h2>
                </div>
                <div class="content">
                    <div class="refund-badge">💳 Refund Successful</div>
                    
                    <h3>Hello ${user.name},</h3>
                    <p>Your refund has been successfully processed.</p>
                    
                    <h4>Refund Details:</h4>
                    <p><strong>Refund Amount:</strong> ₹${refundAmount}</p>
                    <p><strong>Order ID:</strong> ${subscription.orderId}</p>
                    <p><strong>Payment ID:</strong> ${subscription.paymentId}</p>
                    
                    <p>The refund will be credited to your original payment method within 5-7 business days.</p>
                    
                    <p>We're sorry to see you go. If you have any feedback, we'd love to hear it!</p>
                </div>
                <div class="footer">
                    <p>Questions? Contact us at support@tiffo.com</p>
                    <p>&copy; ${new Date().getFullYear()} TIFFO. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

  const text = `
Refund Processed - TIFFO

Hello ${user.name},

Your refund has been successfully processed.

Refund Amount: ₹${refundAmount}
Order ID: ${subscription.orderId}
Payment ID: ${subscription.paymentId}

The refund will be credited to your original payment method within 5-7 business days.

Questions? Contact us at support@tiffo.com
    `;

  return await sendEmail(user.email, subject, html, text);
};

/**
 * Send email verification link
 */
const sendVerificationEmail = async (user, verificationUrl) => {
  const subject = '📧 Verify Your Email Address - TIFFO';

  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { background: #7f1d1d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🍛 TIFFO</h1>
                    <h2>Welcome to TIFFO!</h2>
                </div>
                <div class="content">
                    <h3>Hello ${user.name},</h3>
                    <p>Thank you for signing up with TIFFO! Please click the button below to verify your email address and activate your account.</p>
                    
                    <div style="text-align: center;">
                        <a href="${verificationUrl}" class="button" style="color: white; text-decoration: none;">Verify Email Address</a>
                    </div>
                    
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all;"><a href="${verificationUrl}">${verificationUrl}</a></p>
                    
                    <p>This link is valid for 24 hours.</p>
                    
                    <p>Thank you, <br>The TIFFO Team</p>
                </div>
                <div class="footer">
                    <p>If you did not request this, please ignore this email.</p>
                    <p>&copy; ${new Date().getFullYear()} TIFFO. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

  const text = `
Welcome to TIFFO!

Hello ${user.name},

Thank you for signing up with TIFFO! Please verify your email address by visiting the link below:

${verificationUrl}

This link is valid for 24 hours.

If you did not request this, please ignore this email.

The TIFFO Team
    `;

  return await sendEmail(user.email, subject, html, text);
};

module.exports = {
  initializeEmailService,
  sendEmail,
  sendPaymentConfirmation,
  sendPaymentFailure,
  sendPartnerPaymentNotification,
  sendAdminTransferFailureAlert,
  sendRefundConfirmation,
  sendVerificationEmail,
};
