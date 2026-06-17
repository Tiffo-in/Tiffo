const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Partner = require('../models/Partner');
const logger = require('../utils/logger');
const { setCsrfCookie } = require('../middlewares/csrf');
const { sendVerificationEmail } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  // Set CSRF double-submit cookie (non-httpOnly so JS can read it)
  setCsrfCookie(user._id.toString(), res);

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token, // Mobile clients require the token in the JSON payload
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    // NOTE: `role` is intentionally NOT accepted from the request body.
    // All self-registered users are always 'user'. Partners are promoted via admin.

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'user', // always default — never trust client-supplied role
      address,
      isEmailVerified: false,
      emailVerificationToken: token,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${token}`;
    await sendVerificationEmail(user, verificationUrl);

    res.status(201).json({
      success: true,
      message:
        'Registration successful! Please check your email to verify your account before logging in.',
    });
  } catch (error) {
    logger.error('register error:', { stack: error.stack });
    res.status(400).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in.',
        isEmailVerified: false,
      });
    }

    // Check if account is suspended — return before issuing a token
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: user.banReason
          ? `Account suspended: ${user.banReason}`
          : 'Your account has been suspended. Please contact support at help@tiffo.in',
      });
    }

    logger.info(`User login: ${user.email} (${user.role})`);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error('login error:', { stack: error.stack });
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

const getMe = async (req, res) => {
  try {
    // Explicitly exclude sensitive financial / PII fields from the public profile response
    const user = await User.findById(req.user.id).select(
      '-password -bankDetails -taxDetails -razorpayAccountId -commissionRate',
    );
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error('getMe error:', { stack: error.stack });
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true, runValidators: true },
    ).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    logger.error('updateProfile error:', { stack: error.stack });
    res.status(400).json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide current and new password' });
    }
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    logger.error('changePassword error:', { stack: error.stack });
    res.status(400).json({ success: false, message: error.message });
  }
};

// Partner self-registration — creates user with role='partner' + Partner profile
const registerPartner = async (req, res) => {
  try {
    const { name, email, password, phone, address, businessName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'partner', // safe — this is the dedicated partner endpoint
      address,
      isEmailVerified: false,
      emailVerificationToken: token,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Create the matching Partner profile document
    await Partner.create({
      user: user._id,
      businessName: businessName || name,
      contact: { phone, email },
      address,
    });

    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${token}`;
    await sendVerificationEmail(user, verificationUrl);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your partner account.',
    });
  } catch (error) {
    logger.error('registerPartner error:', { stack: error.stack });
    res.status(400).json({ success: false, message: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { idToken, role } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Google ID Token',
      });
    }

    // Verify token with Google API
    const googleResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
    );

    if (!googleResponse.ok) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google ID Token',
      });
    }

    const googleUser = await googleResponse.json();

    if (!googleUser.email) {
      return res.status(400).json({
        success: false,
        message: 'Google login failed: email not verified/provided',
      });
    }

    const email = googleUser.email;
    let user = await User.findOne({ email });

    if (!user) {
      // Register new user automatically
      const name = googleUser.name || googleUser.given_name || 'Google User';
      // Generate a secure random password
      const randomPassword = crypto.randomBytes(16).toString('hex');

      const targetRole = role === 'partner' ? 'partner' : 'user';

      user = await User.create({
        name,
        email,
        password: randomPassword,
        phone: 'Not provided',
        role: targetRole,
        isActive: true,
        isEmailVerified: true,
      });

      if (targetRole === 'partner') {
        // Create matching Partner profile
        await Partner.create({
          user: user._id,
          businessName: name,
          contact: { phone: 'Not provided', email },
          address: 'Not provided',
        });
      }

      logger.info(`Google User registered: ${email} (${targetRole})`);
    } else {
      // Check if account is suspended — return before issuing a token
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: user.banReason
            ? `Account suspended: ${user.banReason}`
            : 'Your account has been suspended. Please contact support at help@tiffo.in',
        });
      }

      logger.info(`Google User logged in: ${email} (${user.role})`);
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error('googleLogin error:', { stack: error.stack });
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
};

const logout = (req, res) => {
  // Clear both auth and CSRF cookies on logout
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.clearCookie('csrf_token', {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?verified=false&reason=missing_token`,
      );
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?verified=false&reason=invalid_or_expired_token`,
      );
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    logger.info(`Email verified for user: ${user.email}`);

    return res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?verified=true`,
    );
  } catch (error) {
    logger.error('verifyEmail error:', { stack: error.stack });
    return res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?verified=false&reason=server_error`,
    );
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = token;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${token}`;
    await sendVerificationEmail(user, verificationUrl);

    res.json({
      success: true,
      message: 'Verification email resent successfully! Please check your inbox.',
    });
  } catch (error) {
    logger.error('resendVerification error:', { stack: error.stack });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  register,
  registerPartner,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  googleLogin,
  verifyEmail,
  resendVerification,
};
