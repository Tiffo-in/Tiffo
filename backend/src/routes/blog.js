const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    getAllPostsAdmin,
    getAllPosts,
    getPostBySlug,
    incrementViews,
    getBlogStats,
    getCategories
} = require('../controllers/blogController');

// Public routes
router.get('/', getAllPosts);
router.get('/categories', getCategories);
router.get('/:slug', getPostBySlug);
router.post('/:id/view', incrementViews);

// Admin routes
router.post('/', protect, authorize('admin'), createBlogPost);
router.put('/:id', protect, authorize('admin'), updateBlogPost);
router.delete('/:id', protect, authorize('admin'), deleteBlogPost);
router.get('/admin/all', protect, authorize('admin'), getAllPostsAdmin);
router.get('/admin/stats', protect, authorize('admin'), getBlogStats);

module.exports = router;
