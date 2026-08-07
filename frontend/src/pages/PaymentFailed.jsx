import React from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircleIcon, ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subscriptionId = searchParams.get('subscription');
  const errorCode = searchParams.get('error');

  const getErrorMessage = (code) => {
    const errorMessages = {
      BAD_REQUEST_ERROR: 'Invalid payment request. Please verify details and try again.',
      GATEWAY_ERROR: 'Payment gateway communication error. Please try again in a few moments.',
      NETWORK_ERROR: 'Network connectivity issue. Please check your internet connection.',
      SERVER_ERROR: 'Server processing error. Please retry shortly.',
      AUTHENTICATION_ERROR: 'Payment authentication failed.',
      AUTHORIZATION_ERROR: 'Payment authorization failed.',
      INTERNAL_ERROR: 'An unexpected transaction error occurred.',
    };

    return errorMessages[code] || 'Transaction could not be completed. Please try again.';
  };

  const handleRetry = () => {
    if (subscriptionId) {
      navigate(`/checkout/${subscriptionId}`);
    } else {
      navigate('/tiffins');
    }
  };

  return (
    <div className="min-h-screen bg-surface-page text-neutral-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-surface border border-neutral-200 rounded-3xl shadow-card-hover p-8 text-center space-y-6"
      >
        {/* Error Animation Container */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-2"
        >
          <div className="w-20 h-20 bg-red-100 border border-red-200 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-card-hover">
            <XCircleIcon className="w-10 h-10" />
          </div>
        </motion.div>

        {/* Error Message */}
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-neutral-900">Payment Failed</h1>
          <p className="text-xs text-red-600 font-medium">{getErrorMessage(errorCode)}</p>
        </div>

        {/* Reasons Card */}
        <div className="bg-surface-alt border border-neutral-200 rounded-2xl p-4 text-left space-y-2">
          <h3 className="font-bold text-xs text-neutral-900">Possible Reasons:</h3>
          <ul className="space-y-1.5 text-xs text-neutral-600">
            <li className="flex items-center space-x-2">
              <span className="text-red-500">•</span>
              <span>Insufficient account balance or bank limit reached</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-red-500">•</span>
              <span>Transaction timed out or canceled by bank</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-red-500">•</span>
              <span>Temporary payment gateway timeout</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleRetry}
            className="btn-primary w-full py-3 text-xs flex items-center justify-center space-x-2 active:scale-95"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Try Payment Again</span>
          </button>
          <Link
            to="/dashboard"
            className="block w-full py-2.5 rounded-xl bg-surface-alt hover:bg-neutral-200 border border-neutral-200 text-neutral-700 font-semibold text-xs transition-all text-center"
          >
            Return to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailed;
