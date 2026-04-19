const express = require('express');
const { register, registerPartner, login, logout, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Public self-registration (always creates role='user') — strict rate limited
router.post('/register', authLimiter, register);

// Partner registration — separate endpoint, still strict rate limited
router.post('/register/partner', authLimiter, registerPartner);

// Login / Logout
router.post('/login', authLimiter, login);
router.post('/logout', logout);

// Protected profile routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/password', protect, changePassword);

module.exports = router;