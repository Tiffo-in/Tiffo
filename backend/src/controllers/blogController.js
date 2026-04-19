const Blog = require('../models/Blog');
const User = require('../models/User');

/**
 * Create new blog post (Admin only)
 * POST /api/blog
 */
exports.createBlogPost = async (req, res) => {
    try {
        const { title, excerpt, content, category, tags, featuredImage, status, seo, isFeatured } = req.body;

        const blogPost = await Blog.create({
            title,
            excerpt,
            content,
            author: req.user.id,
            category,
            tags,
            featuredImage,
            status: status || 'draft',
            seo,
            isFeatured: isFeatured || false
        });

        await blogPost.populate('author', 'name email');

        res.status(201).json({
            success: true,
            message: 'Blog post created successfully',
            data: blogPost
        });
    } catch (error) {
        console.error('Create blog post error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create blog post'
        });
    }
};

/**
 * Update blog post (Admin only)
 * PUT /api/blog/:id
 */
exports.updateBlogPost = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const blogPost = await Blog.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).populate('author', 'name email');

        if (!blogPost) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        res.json({
            success: true,
            message: 'Blog post updated successfully',
            data: blogPost
        });
    } catch (error) {
        console.error('Update blog post error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update blog post'
        });
    }
};

/**
 * Delete blog post (Admin only)
 * DELETE /api/blog/:id
 */
exports.deleteBlogPost = async (req, res) => {
    try {
        const { id } = req.params;

        const blogPost = await Blog.findByIdAndDelete(id);

        if (!blogPost) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        res.json({
            success: true,
            message: 'Blog post deleted successfully'
        });
    } catch (error) {
        console.error('Delete blog post error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete blog post'
        });
    }
};

/**
 * Get all posts for admin (includes drafts)
 * GET /api/blog/admin/all
 */
exports.getAllPostsAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { status, category, search } = req.query;

        const query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const posts = await Blog.find(query)
            .populate('author', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Blog.countDocuments(query);

        res.json({
            success: true,
            data: posts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all posts admin error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch blog posts'
        });
    }
};

/**
 * Get published posts (Public)
 * GET /api/blog
 */
exports.getAllPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const { category, tag } = req.query;

        const query = { status: 'published' };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (tag) {
            query.tags = tag;
        }

        const posts = await Blog.find(query)
            .select('-content') // Exclude full content for list view
            .populate('author', 'name')
            .sort({ publishedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Blog.countDocuments(query);

        res.json({
            success: true,
            data: posts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all posts error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch blog posts'
        });
    }
};

/**
 * Get single post by slug (Public)
 * GET /api/blog/:slug
 */
exports.getPostBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const post = await Blog.findOne({ slug, status: 'published' })
            .populate('author', 'name email');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        res.json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('Get post by slug error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch blog post'
        });
    }
};

/**
 * Increment post views
 * POST /api/blog/:id/view
 */
exports.incrementViews = async (req, res) => {
    try {
        const { id } = req.params;

        await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } });

        res.json({
            success: true,
            message: 'View counted'
        });
    } catch (error) {
        console.error('Increment views error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to increment views'
        });
    }
};

/**
 * Get blog statistics (Admin)
 * GET /api/blog/admin/stats
 */
exports.getBlogStats = async (req, res) => {
    try {
        const [totalPosts, publishedPosts, draftPosts, archivedPosts, totalViews] = await Promise.all([
            Blog.countDocuments(),
            Blog.countDocuments({ status: 'published' }),
            Blog.countDocuments({ status: 'draft' }),
            Blog.countDocuments({ status: 'archived' }),
            Blog.aggregate([
                { $group: { _id: null, total: { $sum: '$views' } } }
            ])
        ]);

        // Category distribution
        const categoryStats = await Blog.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Most viewed posts
        const mostViewed = await Blog.find({ status: 'published' })
            .select('title slug views publishedAt')
            .sort({ views: -1 })
            .limit(5);

        // Recent posts
        const recentPosts = await Blog.find()
            .select('title slug status createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                overview: {
                    totalPosts,
                    publishedPosts,
                    draftPosts,
                    archivedPosts,
                    totalViews: totalViews[0]?.total || 0
                },
                categoryStats,
                mostViewed,
                recentPosts
            }
        });
    } catch (error) {
        console.error('Get blog stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch statistics'
        });
    }
};

/**
 * Get all categories with post counts
 * GET /api/blog/categories
 */
exports.getCategories = async (req, res) => {
    try {
        const categories = await Blog.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            {
                $project: {
                    _id: 0,
                    name: '$_id',
                    count: 1
                }
            }
        ]);

        // Add "All" category
        const total = await Blog.countDocuments({ status: 'published' });
        const allCategories = [
            { name: 'All', count: total },
            ...categories
        ];

        res.json({
            success: true,
            data: allCategories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch categories'
        });
    }
};

module.exports = exports;
