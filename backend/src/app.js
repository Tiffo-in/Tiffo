require('dotenv').config();
const Sentry = require('@sentry/node');

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
}

// ── Environment validation — fail fast before any service initializes ─────────
const validateEnv = require('./utils/validateEnv');
validateEnv();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const { apiLimiter } = require('./middlewares/rateLimiter');
const compression = require('compression');
const http = require('http');

const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');
const { initializeSocket } = require('./services/socketService');
const { initializeEmailService } = require('./services/emailService');
const logger = require('./utils/logger');

// Route imports
const authRoutes = require('./routes/auth');
const tiffinRoutes = require('./routes/tiffins');
const partnerRoutes = require('./routes/partner');
const deliveryRoutes = require('./routes/deliveries');
const subscriptionRoutes = require('./routes/subscriptions');
const paymentRoutes = require('./routes/payment');
const webhookRoutes = require('./routes/webhook');
const adminRoutes = require('./routes/admin');
const exportRoutes = require('./routes/export');
const messageRoutes = require('./routes/message');
const bulkRoutes = require('./routes/bulk');
const reviewRoutes = require('./routes/reviews');
const analyticsRoutes = require('./routes/analytics');
const blogRoutes = require('./routes/blog');
const supportRoutes = require('./routes/support');
const fraudRoutes = require('./routes/fraud');
const uploadRoutes = require('./routes/upload');
const adRoutes = require('./routes/adRoutes');
const waitlistRoutes = require('./routes/waitlist');
const sitemapRoutes = require('./routes/sitemap');
const { swaggerUi, specs } = require('./config/swagger');

const app = express();

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Connect to database
connectDB();

// Initialize email service
initializeEmailService();

const { csrfProtection } = require('./middlewares/csrf');

app.use(compression());

// Security middleware
app.use(helmet());

// CORS — reads allowed origins from environment so no code change is needed between dev and prod
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
      ? [process.env.FRONTEND_URL]
      : []
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3005',
        'http://localhost:5173',
      ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  }),
);

// Rate limiting
app.use('/api/', apiLimiter);

// Razorpay webhook — must be registered with raw body parser BEFORE express.json()
// so that HMAC signature verification receives the original raw bytes from Razorpay.
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

// Body parser (global — runs after the webhook raw-body override above)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CSRF Protection — MUST run after cookieParser
// Protects all POST, PUT, PATCH, DELETE requests
app.use(csrfProtection);

// Security: strip MongoDB operators ($, .) from user input to prevent NoSQL injection
app.use(mongoSanitize());

// Security: sanitize string values in req.body to strip HTML/XSS
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitizeValue = (val) => {
      if (typeof val === 'string') return xss(val);
      if (Array.isArray(val)) return val.map(sanitizeValue);
      if (val !== null && typeof val === 'object') {
        return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, sanitizeValue(v)]));
      }
      return val;
    };
    req.body = sanitizeValue(req.body);
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tiffins', tiffinRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
// Note: /api/webhooks is already mounted above with raw body parser
app.use('/api/admin', adminRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/bulk', bulkRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/sitemap.xml', sitemapRoutes);

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check — includes live DB ping and process uptime
app.get('/api/health', async (req, res) => {
  let dbStatus = 'unknown';
  try {
    const mongoose = require('mongoose');
    await mongoose.connection.db.command({ ping: 1 });
    dbStatus = 'ok';
  } catch {
    dbStatus = 'error';
  }

  const status = dbStatus === 'ok' ? 200 : 503;
  res.status(status).json({
    success: dbStatus === 'ok',
    message: 'Tiffo API',
    dbStatus,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    socketEnabled: !!io,
  });
});

// Sentry error handler — MUST be before your custom error handler
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// Error handler
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info('Socket.io ready for connections');
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

// Graceful shutdown for Docker / Kubernetes SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Closing HTTP server gracefully...');
  server.close(() => {
    logger.info('HTTP server closed. Exiting.');
    process.exit(0);
  });
  // Force exit if server hasn't closed after 10 seconds
  setTimeout(() => {
    logger.error('Forced exit after 10s timeout.');
    process.exit(1);
  }, 10_000);
});

module.exports = { app, server, io };
