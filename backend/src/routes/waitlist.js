const express = require('express');
const { joinWaitlist } = require('../controllers/waitlistController');
const router = express.Router();

// POST /api/waitlist
router.post('/', joinWaitlist);

module.exports = router;
