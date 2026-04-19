const express = require('express');
const router = express.Router();
const { 
  createFraudReport, 
  getFraudReports, 
  updateFraudReportStatus 
} = require('../controllers/fraudController');
const { protect, authorize } = require('../middlewares/auth');
const { adminAuth } = require('../middlewares/adminAuth');

// Public route for submitting reports
router.post('/', async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (e) {
      // Ignore token errors for public routes
    }
  }
  next();
}, createFraudReport);

// Admin only routes
router.use(protect);
router.use(adminAuth);

router.get('/', getFraudReports);
router.put('/:id/status', updateFraudReportStatus);

module.exports = router;
