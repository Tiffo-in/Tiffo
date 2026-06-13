const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { adminAuth } = require('../middlewares/adminAuth');
const {
  bulkUpdateStatus,
  bulkDelete,
  bulkNotify,
  bulkVerify,
  getBulkStats,
} = require('../controllers/bulkController');

// All bulk routes require admin authentication
router.use(protect);
router.use(adminAuth);

router.post('/status', bulkUpdateStatus);
router.post('/delete', bulkDelete);
router.post('/notify', bulkNotify);
router.post('/verify', bulkVerify);
router.post('/stats', getBulkStats);

module.exports = router;
