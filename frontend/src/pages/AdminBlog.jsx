import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminBlog = () => {
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ status: 'all', category: 'all', search: '' });
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        loadStats();
    }, []);

    useEffect(() => {
        loadPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, page]);

    const loadStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/blog/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const loadPosts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page,
                limit: 10,
                ...filter
            });

            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/blog/admin/all?${params}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            const result = await response.json();
            if (result.success) {
                setPosts(result.data);
                setPagination(result.pagination);
            }
        } catch (error) {
            console.error('Failed to load posts:', error);
            toast.error('Failed to load blog posts');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/blog/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();
            if (result.success) {
                toast.success('Post deleted successfully');
                loadPosts();
                loadStats();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete post');
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === 'published' ? 'draft' : 'published';

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/blog/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            const result = await response.json();
            if (result.success) {
                toast.success(`Post ${newStatus === 'published' ? 'published' : 'unpublished'}`);
                loadPosts();
                loadStats();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Status toggle error:', error);
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
                        <p className="text-gray-600 mt-1">Create and manage blog posts</p>
                    </div>
                    <Link to="/admin/blog/new" className="btn-primary">
                        ✏️ Create New Post
                    </Link>
                </div>

                {/* Statistics Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="text-sm text-gray-600">Total Posts</div>
                            <div className="text-2xl font-bold text-gray-900">{stats.overview.totalPosts}</div>
                        </div>
                        <div className="bg-green-50 p-6 rounded-lg shadow">
                            <div className="text-sm text-green-600">Published</div>
                            <div className="text-2xl font-bold text-green-700">{stats.overview.publishedPosts}</div>
                        </div>
                        <div className="bg-yellow-50 p-6 rounded-lg shadow">
                            <div className="text-sm text-yellow-600">Drafts</div>
                            <div className="text-2xl font-bold text-yellow-700">{stats.overview.draftPosts}</div>
                        </div>
                        <div className="bg-gray-100 p-6 rounded-lg shadow">
                            <div className="text-sm text-gray-600">Archived</div>
                            <div className="text-2xl font-bold text-gray-700">{stats.overview.archivedPosts}</div>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-lg shadow">
                            <div className="text-sm text-blue-600">Total Views</div>
                            <div className="text-2xl font-bold text-blue-700">{stats.overview.totalViews.toLocaleString()}</div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Search posts..."
                                value={filter.search}
                                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={filter.status}
                                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon-500"
                            >
                                <option value="all">All Status</option>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={filter.category}
                                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon-500"
                            >
                                <option value="all">All Categories</option>
                                <option value="Food Tips">Food Tips</option>
                                <option value="Health & Nutrition">Health & Nutrition</option>
                                <option value="Recipes">Recipes</option>
                                <option value="Partner Stories">Partner Stories</option>
                                <option value="Platform Updates">Platform Updates</option>
                                <option value="Community">Community</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Posts Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400">Loading...</div>
                        </div>
                    ) : posts.length > 0 ? (
                        <>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Post</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {posts.map(post => (
                                        <tr key={post._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{post.title}</div>
                                                <div className="text-sm text-gray-500 line-clamp-1">{post.excerpt}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                                    {post.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded ${post.status === 'published' ? 'bg-green-100 text-green-800' :
                                                        post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {post.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {post.views}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <Link
                                                        to={`/admin/blog/edit/${post._id}`}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleStatusToggle(post._id, post.status)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        {post.status === 'published' ? 'Unpublish' : 'Publish'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(post._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {pagination && pagination.pages > 1 && (
                                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{((page - 1) * pagination.limit) + 1}</span> to{' '}
                                        <span className="font-medium">{Math.min(page * pagination.limit, pagination.total)}</span> of{' '}
                                        <span className="font-medium">{pagination.total}</span> results
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPage(page - 1)}
                                            disabled={page === 1}
                                            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setPage(page + 1)}
                                            disabled={page === pagination.pages}
                                            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-4">📝</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                            <p className="text-gray-600 mb-4">Get started by creating your first blog post</p>
                            <Link to="/admin/blog/new" className="btn-primary">
                                Create New Post
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminBlog;
