const express = require('express');
const {
  getTiffins,
  getTiffin,
  createTiffin,
  updateTiffin,
  deleteTiffin,
  updateDiscount,
  updateMenuItems,
  getMyTiffins,
} = require('../controllers/tiffinController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Partner's own tiffins (must come before /:id to avoid conflict)
router.get('/mine', protect, authorize('partner'), getMyTiffins);

router.route('/').get(getTiffins).post(protect, authorize('partner'), createTiffin);

router
  .route('/:id')
  .get(getTiffin)
  .put(protect, authorize('partner'), updateTiffin)
  .delete(protect, authorize('partner'), deleteTiffin);

// Dedicated discount management endpoint for partners
router.patch('/:id/discount', protect, authorize('partner'), updateDiscount);

// Menu items management endpoint for partners
router.patch('/:id/menu', protect, authorize('partner'), updateMenuItems);

module.exports = router;
