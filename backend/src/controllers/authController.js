const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Partner = require('../models/Partner');
const logger = require('../utils/logger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token, // still sending token in body for any mobile app clients if needed, though strictly cookie is better for web
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
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
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'user', // always default — never trust client-supplied role
      address
    });

    sendTokenResponse(user, 201, res);
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
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error('login error:', { stack: error.stack });
    res.status(400).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    // Explicitly exclude sensitive financial / PII fields from the public profile response
    const user = await User.findById(req.user.id)
      .select('-password -bankDetails -taxDetails -razorpayAccountId -commissionRate');
    res.json({
      success: true,
      user
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
      { new: true, runValidators: true }
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
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
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
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'partner', // safe — this is the dedicated partner endpoint
      address
    });

    // Create the matching Partner profile document
    await Partner.create({
      user: user._id,
      businessName: businessName || name,
      contact: { phone, email },
      address
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    logger.error('registerPartner error:', { stack: error.stack });
    res.status(400).json({ success: false, message: error.message });
  }
};

const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  register,
  registerPartner,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword
};