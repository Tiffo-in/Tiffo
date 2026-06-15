const Tiffin = require('../models/Tiffin');
const Blog = require('../models/Blog');
const logger = require('../utils/logger');

/**
 * Generates a dynamic sitemap.xml
 * Includes static routes, all active tiffins, and all published blog posts.
 */
exports.getSitemap = async (req, res) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'https://tiffo.in';

    // Static routes
    const staticRoutes = [
      '',
      '/tiffins',
      '/blog',
      '/support',
      '/privacy',
      '/terms',
      '/security',
      '/register?role=partner',
    ];

    // Fetch dynamic data
    const [tiffins, blogs] = await Promise.all([
      Tiffin.find({ isActive: true }).select('_id updatedAt').lean(),
      Blog.find({ status: 'published' }).select('slug updatedAt').lean(),
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static routes
    staticRoutes.forEach((route) => {
      xml += `
  <url>
    <loc>${frontendUrl}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    // Add Tiffins
    tiffins.forEach((tiffin) => {
      xml += `
  <url>
    <loc>${frontendUrl}/tiffins/${tiffin._id}</loc>
    <lastmod>${tiffin.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Add Blogs
    blogs.forEach((blog) => {
      xml += `
  <url>
    <loc>${frontendUrl}/blog/${blog.slug}</loc>
    <lastmod>${blog.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    logger.error('Sitemap generation error:', err);
    res.status(500).send('Error generating sitemap');
  }
};
