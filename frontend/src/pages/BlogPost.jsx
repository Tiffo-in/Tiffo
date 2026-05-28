import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import ReactMarkdown from 'react-markdown';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Fetch the main post
        const response = await fetch(`${process.env.REACT_APP_API_URL}/blog/${slug}`);
        const result = await response.json();

        if (result.success && result.data) {
          setPost(result.data);

          // Fetch related posts (could be optimized with a dedicated endpoint)
          const allResponse = await fetch(`${process.env.REACT_APP_API_URL}/blog`);
          const allResult = await allResponse.json();

          if (allResult.success) {
            const related = allResult.data
              .filter((p) => p.category === result.data.category && p._id !== result.data._id)
              .slice(0, 3);
            setRelatedPosts(related);
          }
        } else {
          console.error('Post not found API response:', result);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
      }
    };

    fetchPost();
  }, [slug]);

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Share functions
  const shareOnTwitter = () => {
    const url = window.location.href;
    const text = `Check out: ${post.title}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const shareOnLinkedIn = () => {
    const url = window.location.href;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const text = `${post.title} - ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
          <button onClick={() => navigate('/blog')} className="btn-primary">
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <motion.div
          className="h-full bg-maroon-600"
          style={{ width: `${readingProgress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-maroon-600 to-maroon-800 dark:from-maroon-900 dark:to-neutral-950 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-4xl mx-auto px-4 h-full flex flex-col justify-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/blog"
              className="inline-flex items-center text-white/80 hover:text-white mb-4"
            >
              ← Back to Blog
            </Link>
            <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium mb-4">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center text-sm text-white/90">
              <span>{typeof post.author === 'object' ? post.author?.name : post.author}</span>
              <span className="mx-2">•</span>
              <span>
                {new Date(post.createdAt || post.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="mx-2">•</span>
              <span>{post.readTime}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Social Share */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-24">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Share this article</h3>
              <div className="flex lg:flex-col gap-3">
                <button
                  onClick={shareOnTwitter}
                  className="flex items-center justify-center p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  title="Share on Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                  </svg>
                </button>
                <button
                  onClick={shareOnFacebook}
                  className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Share on Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
                  </svg>
                </button>
                <button
                  onClick={shareOnLinkedIn}
                  className="flex items-center justify-center p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                  title="Share on LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </button>
                <button
                  onClick={shareOnWhatsApp}
                  className="flex items-center justify-center p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  title="Share on WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
                  </svg>
                </button>
                <button
                  onClick={copyLink}
                  className="flex items-center justify-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  title="Copy Link"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>

              {/* Stats */}
              <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Views</span>
                    <span className="font-semibold">{post.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Likes</span>
                    <span className="font-semibold">{post.likes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Comments</span>
                    <span className="font-semibold">{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <article className="bg-white rounded-lg shadow-sm p-8 prose prose-lg max-w-none">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </article>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author Bio */}
            <div className="mt-8 bg-gradient-to-r from-maroon-50 to-orange-50 dark:from-neutral-800 dark:to-neutral-900 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-maroon-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {(typeof post.author === 'object'
                      ? post.author?.name || 'A'
                      : post.author || 'A'
                    ).charAt(0)}
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {typeof post.author === 'object' ? post.author?.name : post.author}
                  </h3>
                  <p className="text-gray-600 mt-1">{post.authorBio}</p>
                </div>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost._id || relatedPost.id}
                      to={`/blog/${relatedPost.slug}`}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="bg-gray-100 h-32 flex items-center justify-center text-4xl">
                        🍱
                      </div>
                      <div className="p-4">
                        <span className="text-xs font-medium text-maroon-600">
                          {relatedPost.category}
                        </span>
                        <h3 className="text-sm font-semibold text-gray-900 mt-2 line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-2">{relatedPost.readTime}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
