import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { partnerService } from '../services/partnerService';

const CustomerDetails = ({ customerId }) => {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const response = await partnerService.getCustomerDetails(customerId);
      setCustomerData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch customer details');
    } finally {
      setLoading(false);
    }
  };

  if (!customerId) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        Select a customer to view details
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-red-600">
        <p>{error}</p>
        <button 
          onClick={fetchCustomerDetails}
          className="mt-2 text-blue-600 hover:text-blue-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { customer, subscription, deliveryStats, payments, reviews } = customerData;

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Customer Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">{customer.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{customer.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{customer.phone}</p>
          </div>
        </div>
      </div>

      {/* Subscription Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Subscription Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Tiffin</p>
            <p className="font-semibold text-orange-600">{subscription.tiffin.title}</p>
            <p className="text-sm text-gray-500">₹{subscription.tiffin.price?.daily}/day</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Plan</p>
            <p className="font-semibold text-blue-600 capitalize">{subscription.plan}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Remaining Days</p>
            <p className="font-semibold text-green-600">{subscription.remainingDays} days</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Delivery Time</p>
            <p className="font-semibold text-purple-600">{subscription.deliveryTime}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Payment Status</p>
            <p className={`font-semibold capitalize ${
              subscription.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'
            }`}>
              {subscription.paymentStatus}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Delivery Rate</p>
            <p className="font-semibold text-gray-600">
              {deliveryStats.percentage}% ({deliveryStats.delivered}/{deliveryStats.total})
            </p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Payment History</h3>
        {payments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No payments found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Method</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b">
                    <td className="py-2">{new Date(payment.date).toLocaleDateString()}</td>
                    <td className="py-2">₹{payment.amount}</td>
                    <td className="py-2 capitalize">{payment.method}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payment.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reviews & Feedback */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Customer Feedback</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-700 mb-2">{review.comment}</p>
                )}
                {review.categories && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {Object.entries(review.categories).map(([category, rating]) => (
                      <div key={category} className="bg-gray-50 p-2 rounded">
                        <p className="capitalize font-medium">{category}</p>
                        <p className="text-yellow-600">{rating}/5 ★</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CustomerDetails;