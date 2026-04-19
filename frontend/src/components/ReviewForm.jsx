import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const ReviewForm = ({ subscriptionId, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [categories, setCategories] = useState({
        taste: 0,
        quality: 0,
        delivery: 0,
        packaging: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCategoryRating = (category, value) => {
        setCategories(prev => ({ ...prev, [category]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (!comment.trim()) {
            toast.error('Please write a comment');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${process.env.REACT_APP_API_URL}/reviews`,
                {
                    subscriptionId,
                    rating,
                    comment,
                    categories
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success('Review submitted successfully!');
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = (currentRating, onRatingChange, size = 'large') => {
        const sizeClass = size === 'small' ? 'h-5 w-5' : 'h-8 w-8';

        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onMouseEnter={() => onRatingChange && setHoverRating(star)}
                        onMouseLeave={() => onRatingChange && setHoverRating(0)}
                        onClick={() => onRatingChange && onRatingChange(star)}
                        className="transition-transform hover:scale-110"
                    >
                        {(hoverRating || currentRating) >= star ? (
                            <StarIcon className={`${sizeClass} text-yellow-400`} />
                        ) : (
                            <StarOutline className={`${sizeClass} text-gray-300`} />
                        )}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Write a Review</h3>
                <p className="text-gray-600">Share your experience with this tiffin service</p>
            </div>

            {/* Overall Rating */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Overall Rating *
                </label>
                {renderStars(rating, setRating)}
                <p className="text-sm text-gray-500 mt-1">
                    {rating > 0 && `You rated ${rating} out of 5 stars`}
                </p>
            </div>

            {/* Category Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(categories).map((category) => (
                    <div key={category}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                            {category}
                        </label>
                        {renderStars(
                            categories[category],
                            (value) => handleCategoryRating(category, value),
                            'small'
                        )}
                    </div>
                ))}
            </div>

            {/* Comment */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Review *
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={500}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    placeholder="Tell us about your experience..."
                    required
                />
                <p className="text-sm text-gray-500 mt-1 text-right">
                    {comment.length}/500 characters
                </p>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting || rating === 0 || !comment.trim()}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${isSubmitting || rating === 0 || !comment.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950'
                    }`}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
};

export default ReviewForm;
