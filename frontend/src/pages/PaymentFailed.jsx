import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const PaymentFailed = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const subscriptionId = searchParams.get('subscription');
    const errorCode = searchParams.get('error');

    const getErrorMessage = (code) => {
        const errorMessages = {
            'BAD_REQUEST_ERROR': 'Invalid payment request. Please try again.',
            'GATEWAY_ERROR': 'Payment gateway error. Please try again later.',
            'NETWORK_ERROR': 'Network connection issue. Please check your internet.',
            'SERVER_ERROR': 'Server error. Please try again later.',
            'AUTHENTICATION_ERROR': 'Payment authentication failed.',
            'AUTHORIZATION_ERROR': 'Payment authorization failed.',
            'INTERNAL_ERROR': 'An unexpected error occurred.'
        };

        return errorMessages[code] || 'Payment failed. Please try again.';
    };

    const handleRetry = () => {
        if (subscriptionId) {
            navigate(`/checkout/${subscriptionId}`);
        } else {
            navigate('/tiffins');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-neutral-900 dark:to-neutral-950 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center"
            >
                {/* Error Animation */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="mb-6"
                >
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </motion.div>

                {/* Error Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                    <p className="text-gray-600 mb-6">
                        {getErrorMessage(errorCode)}
                    </p>

                    {/* Common Reasons */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <h3 className="font-semibold text-gray-900 mb-3">Common Reasons:</h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start">
                                <span className="text-red-600 mr-2">•</span>
                                <span>Insufficient funds in your account</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-red-600 mr-2">•</span>
                                <span>Incorrect card details or CVV</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-red-600 mr-2">•</span>
                                <span>Card limit exceeded</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-red-600 mr-2">•</span>
                                <span>Bank declined the transaction</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-red-600 mr-2">•</span>
                                <span>Network or connectivity issues</span>
                            </li>
                        </ul>
                    </div>

                    {/* Support Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            💡 <strong>Need Help?</strong> Contact our support team if the issue persists.
                            We're here to help!
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={handleRetry}
                            className="w-full btn-primary"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Go to Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/support')}
                            className="w-full px-4 py-2 border-2 border-maroon-600 text-maroon-600 rounded-lg hover:bg-maroon-50 transition-colors"
                        >
                            Contact Support
                        </button>
                    </div>

                    {/* Reassurance */}
                    <p className="text-xs text-gray-500 mt-4">
                        🔒 No money has been deducted from your account
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default PaymentFailed;
