const Blog = require('../models/Blog');
const logger = require('../utils/logger');

/**
 * Create new blog post (Admin only)
 * POST /api/blog
 */
exports.createBlogPost = async (req, res) => {
  try {
    const { title, excerpt, content, category, tags, featuredImage, status, seo, isFeatured } =
      req.body;

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
      isFeatured: isFeatured || false,
    });

    await blogPost.populate('author', 'name email');

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: blogPost,
    });
  } catch (error) {
    logger.error('Create blog post error:', { stack: error.stack });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create blog post',
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

    // Allowlist only safe, user-facing fields — prevents overwriting
    // internal fields like views, slug, author, or publishedAt.
    const allowedFields = [
      'title',
      'excerpt',
      'content',
      'category',
      'tags',
      'featuredImage',
      'status',
      'seo',
      'isFeatured',
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const blogPost = await Blog.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate('author', 'name email');

    if (!blogPost) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found',
      });
    }

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: blogPost,
    });
  } catch (error) {
    logger.error('Update blog post error:', { stack: error.stack });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update blog post',
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
        message: 'Blog post not found',
      });
    }

    res.json({
      success: true,
      message: 'Blog post deleted successfully',
    });
  } catch (error) {
    logger.error('Delete blog post error:', { stack: error.stack });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete blog post',
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
      // Use MongoDB $text search — leverages the weighted text index
      // (title:10, excerpt:5, content:1) defined in the Blog model.
      // This is orders of magnitude faster than $regex on large content fields.
      query.$text = { $search: search };
    }

    const sortOptions = search
      ? { score: { $meta: 'textScore' }, createdAt: -1 } // relevance-first when searching
      : { createdAt: -1 };

    const [posts, total] = await Promise.all([
      Blog.find(query, search ? { score: { $meta: 'textScore' } } : {})
        .populate('author', 'name email')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit),
      Blog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get all posts admin error:', { stack: error.stack });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch blog posts',
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
    const { category, tag, search } = req.query;

    const query = { status: 'published' };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = search
      ? { score: { $meta: 'textScore' }, publishedAt: -1 }
      : { publishedAt: -1 };

    const [posts, total] = await Promise.all([
      Blog.find(query, search ? { score: { $meta: 'textScore' } } : {})
        .select('-content')
        .populate('author', 'name')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit),
      Blog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get all posts error:', { stack: error.stack });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch blog posts',
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

    const post = await Blog.findOne({ slug, status: 'published' }).populate('author', 'name email');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found',
      });
    }

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    logger.error('Get post by slug error:', { stack: error.stack });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch blog post',
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
      message: 'View counted',
    });
  } catch (error) {
    logger.error('Increment views error:', { stack: error.stack });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to increment views',
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
      Blog.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    ]);

    // Category distribution
    const categoryStats = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
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
          totalViews: totalViews[0]?.total || 0,
        },
        categoryStats,
        mostViewed,
        recentPosts,
      },
    });
  } catch (error) {
    logger.error('Get blog stats error:', { stack: error.stack });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch statistics',
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
          count: 1,
        },
      },
    ]);

    // Add "All" category
    const total = await Blog.countDocuments({ status: 'published' });
    const allCategories = [{ name: 'All', count: total }, ...categories];

    res.json({
      success: true,
      data: allCategories,
    });
  } catch (error) {
    logger.error('Get categories error:', { stack: error.stack });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch categories',
    });
  }
};

module.exports = exports;
