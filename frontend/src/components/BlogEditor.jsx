import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';
import api from '../services/api';

const BlogEditor = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'Food Tips',
        tags: '',
        featuredImage: '',
        status: 'draft',
        isFeatured: false,
        seo: {
            metaTitle: '',
            metaDescription: '',
            keywords: ''
        }
    });

    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(false);

    useEffect(() => {
        if (isEditing) {
            loadPost();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadPost = async () => {
        try {
            const response = await api.get('/blog/admin/all', { params: { search: id } });
            if (response.data.success && response.data.data.length > 0) {
                const post = response.data.data.find(p => p._id === id);
                if (post) {
                    setFormData({
                        title: post.title,
                        excerpt: post.excerpt,
                        content: post.content,
                        category: post.category,
                        tags: post.tags.join(', '),
                        featuredImage: post.featuredImage || '',
                        status: post.status,
                        isFeatured: post.isFeatured || false,
                        seo: {
                            metaTitle: post.seo?.metaTitle || '',
                            metaDescription: post.seo?.metaDescription || '',
                            keywords: post.seo?.keywords?.join(', ') || ''
                        }
                    });
                }
            }
        } catch (error) {
            toast.error('Failed to load post');
        }
    };

    const handleSubmit = async (e, publishNow = false) => {
        e.preventDefault();
        setLoading(true);
        try {
            const postData = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                status: publishNow ? 'published' : formData.status,
                seo: {
                    metaTitle: formData.seo.metaTitle,
                    metaDescription: formData.seo.metaDescription,
                    keywords: formData.seo.keywords.split(',').map(kw => kw.trim()).filter(Boolean)
                }
            };

            const response = isEditing
                ? await api.put(`/blog/${id}`, postData)
                : await api.post('/blog', postData);

            if (response.data.success) {
                toast.success(isEditing ? 'Post updated successfully' : 'Post created successfully');
                navigate('/admin/blog');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save post');
        } finally {
            setLoading(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            [{ 'align': [] }],
            ['clean']
        ]
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet', 'indent',
        'link', 'image',
        'align'
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isEditing ? 'Edit Post' : 'Create New Post'}
                        </h1>
                        <p className="text-gray-600 mt-1">Write and publish blog content</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/admin/blog')}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => setPreview(!preview)}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            {preview ? '📝 Edit' : '👁️ Preview'}
                        </button>
                    </div>
                </div>

                {!preview ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Main Content */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Content</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon-500"
                                        placeholder="Enter post title..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Excerpt *
                                    </label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon-500"
                                        placeholder="Brief summary of the post..."
                                        maxLength={500}
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formData.excerpt.length}/500 characters
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Content *
                                    </label>
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.content}
                                        onChange={(value) => setFormData({ ...formData, content: value })}
                                        modules={modules}
                                        formats={formats}
                                        className="bg-white"
                                        style={{ height: '400px', marginBottom: '50px' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Metadata</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon-500"
                                    >
                                        <option value="Food Tips">Food Tips</option>
                                        <option value="Health & Nutrition">Health & Nutrition</option>
                                        <option value="Recipes">Recipes</option>
                                        <option value="Partner Stories">Partner Stories</option>
                                        <option value="Platform Updates">Platform Updates</option>
                                        <option value="Community">Community</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tags
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon-500"
                                        placeholder="health, nutrition, tips (comma separated)"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Featured Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.featuredImage}
                                        onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon-500"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.isFeatured}
                                            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                            className="rounded border-gray-300 text-maroon-600 focus:ring-maroon-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Mark as featured post
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* SEO */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Meta Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.seo.metaTitle}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            seo: { ...formData.seo, metaTitle: e.target.value }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon-500"
                                        placeholder="SEO-optimized title (60 chars max)"
                                        maxLength={60}
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formData.seo.metaTitle.length}/60 characters
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Meta Description
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={formData.seo.metaDescription}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            seo: { ...formData.seo, metaDescription: e.target.value }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon-500"
                                        placeholder="SEO description (160 chars max)"
                                        maxLength={160}
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formData.seo.metaDescription.length}/160 characters
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Keywords
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.seo.keywords}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            seo: { ...formData.seo, keywords: e.target.value }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon-500"
                                        placeholder="tiffin, food delivery, healthy meals (comma separated)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save as Draft'}
                            </button>
                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e, true)}
                                disabled={loading}
                                className="flex-1 bg-maroon-600 text-white py-2 px-4 rounded-md hover:bg-maroon-700 disabled:opacity-50"
                            >
                                {loading ? 'Publishing...' : 'Publish Now'}
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Preview Mode */
                    <div className="bg-white p-8 rounded-lg shadow">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{formData.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                            <span className="px-3 py-1 bg-gray-100 rounded-full">{formData.category}</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                        <p className="text-xl text-gray-600 mb-8">{formData.excerpt}</p>
                        {formData.featuredImage && (
                            <img
                                src={formData.featuredImage}
                                alt={formData.title}
                                className="w-full h-96 object-cover rounded-lg mb-8"
                            />
                        )}
                        <div
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.content) }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogEditor;
