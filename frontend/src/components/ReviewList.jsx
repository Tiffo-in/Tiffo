import React, { useEffect, useState, useCallback } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import api from '../services/api';
import ReviewForm from './ReviewForm';

const ReviewList = ({ tiffinId, partnerId, limit = 10 }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState('-createdAt');

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = tiffinId
                ? `/reviews/tiffin/${tiffinId}`
                : `/reviews/partner/${partnerId}`;
            const response = await api.get(endpoint, {
                params: { page: currentPage, limit, sort: sortBy }
            });
            setReviews(response.data.reviews ?? []);
            setTotalPages(response.data.totalPages ?? 1);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    }, [tiffinId, partnerId, currentPage, limit, sortBy]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleHelpful = async (reviewId) => {
        try {
            await api.post(`/reviews/${reviewId}/helpful`);
            fetchReviews();
        } catch (error) {
            console.error('Error marking helpful:', error);
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                        key={star}
                        className={`h-4 w-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900"></div>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-lg">No reviews yet. Be the first to review!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Review Submission Form */}
            <ReviewForm
                subscriptionId={tiffinId || partnerId}
                onSuccess={fetchReviews}
            />

            {/* Sort Options */}
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                    Customer Reviews ({reviews.length})
                </h3>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                    <option value="-createdAt">Most Recent</option>
                    <option value="-rating">Highest Rated</option>
                    <option value="rating">Lowest Rated</option>
                    <option value="-helpfulVotes">Most Helpful</option>
                </select>
            </div>

            {/* Reviews */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review._id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center text-white font-bold text-lg">
                                    {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">
                                        {review.user?.name || 'Anonymous'}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        {renderStars(review.rating)}
                                        <span className="text-sm text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Category Ratings */}
                        {review.categories && (
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                                {Object.entries(review.categories).map(([category, rating]) => (
                                    rating > 0 && (
                                        <div key={category} className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-gray-600 capitalize">
                                                {category}:
                                            </span>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <StarIcon
                                                        key={star}
                                                        className={`h-3 w-3 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}

                        {/* Comment */}
                        <p className="mt-4 text-gray-700 leading-relaxed">{review.comment}</p>

                        {/* Helpful Button */}
                        <div className="mt-4 flex items-center gap-2">
                            <button
                                onClick={() => handleHelpful(review._id)}
                                className="text-sm text-gray-600 hover:text-red-900 transition-colors flex items-center gap-1"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                                Helpful ({review.helpfulVotes || 0})
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewList;
