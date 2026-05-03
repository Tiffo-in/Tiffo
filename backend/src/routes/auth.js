const express = require('express');
const { register, registerPartner, login, logout, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');
const { validate, registerValidator, loginValidator, changePasswordValidator } = require('../middlewares/validate');

const router = express.Router();

// Public self-registration (always creates role='user') — strict rate limited + validated
router.post('/register', authLimiter, registerValidator, validate, register);

// Partner registration — separate endpoint, still strict rate limited + validated
router.post('/register/partner', authLimiter, registerValidator, validate, registerPartner);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate user
 *     description: Log in with email and password to receive a JWT session cookie.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/logout', logout);

// Protected profile routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/password', protect, changePasswordValidator, validate, changePassword);

module.exports = router;