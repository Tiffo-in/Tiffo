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
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#14151e] border border-zinc-800/80 rounded-3xl shadow-2xl p-8 text-center space-y-6"
      >
        {/* Error Animation Container */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-2"
        >
          <div className="w-20 h-20 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-full flex items-center justify-center mx-auto shadow-xl">
            <XCircleIcon className="w-10 h-10" />
          </div>
        </motion.div>

        {/* Error Message */}
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-white">Payment Failed</h1>
          <p className="text-xs text-rose-400 font-medium">{getErrorMessage(errorCode)}</p>
        </div>

        {/* Reasons Card */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 text-left space-y-2">
          <h3 className="font-bold text-xs text-white">Possible Reasons:</h3>
          <ul className="space-y-1.5 text-xs text-zinc-400">
            <li className="flex items-center space-x-2">
              <span className="text-rose-500">•</span>
              <span>Insufficient account balance or bank limit reached</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-rose-500">•</span>
              <span>Transaction timed out or canceled by bank</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-rose-500">•</span>
              <span>Temporary payment gateway timeout</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleRetry}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center space-x-2 active:scale-95"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Try Payment Again</span>
          </button>
          <Link
            to="/dashboard"
            className="block w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-all text-center"
          >
            Return to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailed;
