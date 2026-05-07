const express = require('express');
const router = express.Router();
const sitemapController = require('../controllers/sitemapController');

// This route generates the sitemap dynamically
router.get('/', sitemapController.getSitemap);

module.exports = router;
