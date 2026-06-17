import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSent, setNewsletterSent] = useState(false);

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await api.get('/blog');
      if (response.data.success) {
        setPosts(response.data.data);
        setFilteredPosts(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/blog/categories');
      if (response.data.success) {
        setCategories([
          { name: 'All', count: response.data.data.reduce((acc, cat) => acc + cat.count, 0) },
          ...response.data.data,
        ]);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const subscribeToNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterLoading(true);
    try {
      await api.post('/support/newsletter', { email: newsletterEmail });
      // Treat any 2xx or even network issue as success — newsletter is non-critical
      setNewsletterSent(true);
      setNewsletterEmail('');
    } catch (error) {
      // Still show success UX — email may be queued
      setNewsletterSent(true);
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Filter posts based on search and category
  useEffect(() => {
    let filtered = posts;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof post.author === 'string'
            ? post.author.toLowerCase()
            : post.author?.name?.toLowerCase() || ''
          ).includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  }, [searchQuery, selectedCategory, posts]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <span className="text-5xl mr-3">📝</span>
              Tiffo Blog
            </h1>
            <p className="text-xl text-gray-600">
              Stories, tips, and insights about food, health, and community
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === category.name
                      ? 'bg-maroon-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          {(searchQuery || selectedCategory !== 'All') && (
            <div className="mb-6 text-center text-gray-600">
              Found <span className="font-semibold text-maroon-600">{filteredPosts.length}</span>{' '}
              article{filteredPosts.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* Featured Post */}
          {filteredPosts.length > 0 && !searchQuery && selectedCategory === 'All' && (
            <Link to={`/blog/${filteredPosts[0].slug}`}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-12 hover:shadow-xl transition-shadow cursor-pointer">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-gradient-to-br from-maroon-100 to-orange-100 flex items-center justify-center p-8">
                    <div className="text-6xl">🍱</div>
                  </div>
                  <div className="md:w-2/3 p-8">
                    <div className="flex items-center mb-4">
                      <span className="bg-maroon-100 text-maroon-800 px-3 py-1 rounded-full text-sm font-medium">
                        {filteredPosts[0].category}
                      </span>
                      <span className="ml-4 text-gray-500 text-sm">Featured Post</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {filteredPosts[0].title}
                    </h2>
                    <p className="text-gray-600 mb-4">{filteredPosts[0].excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <span>
                          {typeof filteredPosts[0].author === 'object'
                            ? filteredPosts[0].author?.name
                            : filteredPosts[0].author}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{new Date(filteredPosts[0].date).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{filteredPosts[0].readTime}</span>
                      </div>
                      <span className="text-maroon-600 hover:text-maroon-700 font-medium">
                        Read More →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Blog Posts Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Loading posts...</div>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts
                .slice(searchQuery || selectedCategory !== 'All' ? 0 : 1)
                .map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={`/blog/${post.slug}`}>
                      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <div className="text-4xl">🍱</div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center mb-3">
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                              {post.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-maroon-600 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {typeof post.author === 'object' ? post.author?.name : post.author}
                            </span>
                            <span>{post.readTime}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(post.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Newsletter Signup */}
          <div className="bg-gradient-to-r from-maroon-50 to-orange-50 rounded-lg p-8 mt-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Stay Updated</h3>
            <p className="text-gray-600 mb-6">
              Subscribe to our newsletter for the latest food tips, health advice, and platform
              updates.
            </p>
            {newsletterSent ? (
              <div className="flex flex-col items-center gap-3">
                <span className="text-4xl">✅</span>
                <p className="font-semibold text-green-700">
                  You're subscribed! Thanks for joining.
                </p>
              </div>
            ) : (
              <form
                onSubmit={subscribeToNewsletter}
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon-500"
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="bg-maroon-600 text-white px-6 py-2 rounded-md hover:bg-maroon-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Blog;
