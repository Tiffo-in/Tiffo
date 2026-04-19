import React, { useEffect, useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

const RatingsSummary = ({ tiffinId }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [tiffinId]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/reviews/tiffin/${tiffinId}/stats`
            );
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            </div>
        );
    }

    if (!stats || stats.totalReviews === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-gray-600">No ratings yet</p>
            </div>
        );
    }

    const ratingDistribution = [
        { stars: 5, count: stats.fiveStars },
        { stars: 4, count: stats.fourStars },
        { stars: 3, count: stats.threeStars },
        { stars: 2, count: stats.twoStars },
        { stars: 1, count: stats.oneStar }
    ];

    const categoryRatings = [
        { name: 'Taste', rating: stats.avgTaste || 0 },
        { name: 'Quality', rating: stats.avgQuality || 0 },
        { name: 'Delivery', rating: stats.avgDelivery || 0 },
        { name: 'Packaging', rating: stats.avgPackaging || 0 }
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Customer Ratings</h3>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Overall Rating */}
                <div className="text-center md:border-r border-gray-200">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                        {stats.averageRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                                key={star}
                                className={`h-6 w-6 ${star <= Math.round(stats.averageRating)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                    <p className="text-gray-600">
                        Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
                    </p>
                </div>

                {/* Star Distribution */}
                <div className="space-y-2">
                    {ratingDistribution.map(({ stars, count }) => {
                        const percentage = stats.totalReviews > 0
                            ? (count / stats.totalReviews) * 100
                            : 0;

                        return (
                            <div key={stars} className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700 w-12">
                                    {stars} ★
                                </span>
                                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm text-gray-600 w-12 text-right">
                                    {percentage.toFixed(0)}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Category Breakdown */}
            {categoryRatings.some(cat => cat.rating > 0) && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Rating Breakdown</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categoryRatings.map((category) => (
                            category.rating > 0 && (
                                <div key={category.name} className="text-center">
                                    <div className="text-2xl font-bold text-gray-900 mb-1">
                                        {category.rating.toFixed(1)}
                                    </div>
                                    <div className="flex justify-center gap-0.5 mb-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <StarIcon
                                                key={star}
                                                className={`h-3 w-3 ${star <= Math.round(category.rating)
                                                        ? 'text-yellow-400'
                                                        : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600">{category.name}</p>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RatingsSummary;
