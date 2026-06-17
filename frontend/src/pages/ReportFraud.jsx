import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

const ReportFraud = () => {
  const [formData, setFormData] = useState({
    reporterName: '',
    reporterEmail: '',
    reporterPhone: '',
    fraudType: '',
    partnerName: '',
    orderId: '',
    description: '',
    evidence: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/fraud', formData);
      if (response.data.success) {
        toast.success('Fraud report submitted successfully. We will investigate this matter.');
        setFormData({
          reporterName: '',
          reporterEmail: '',
          reporterPhone: '',
          fraudType: '',
          partnerName: '',
          orderId: '',
          description: '',
          evidence: '',
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit report');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[110px] pb-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <h1 className="text-3xl font-bold text-red-800 mb-2">🚨 Report Fraud</h1>
            <p className="text-red-700">
              Help us maintain a safe platform by reporting fraudulent activities.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={formData.reporterName}
                    onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    value={formData.reporterEmail}
                    onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.reporterPhone}
                  onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type of Fraud *
                </label>
                <select
                  value={formData.fraudType}
                  onChange={(e) => setFormData({ ...formData, fraudType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Select fraud type</option>
                  <option value="payment">Payment Fraud</option>
                  <option value="fake_partner">Fake Partner/Restaurant</option>
                  <option value="food_quality">Food Quality Issues</option>
                  <option value="delivery">Delivery Fraud</option>
                  <option value="identity">Identity Theft</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner/Restaurant Name
                  </label>
                  <input
                    type="text"
                    value={formData.partnerName}
                    onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order ID (if applicable)
                  </label>
                  <input
                    type="text"
                    value={formData.orderId}
                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Please provide detailed information about the fraudulent activity..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evidence/Screenshots
                </label>
                <textarea
                  value={formData.evidence}
                  onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Describe any evidence you have (screenshots, receipts, etc.)"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">⚠️ Important Notice</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• All reports are taken seriously and investigated thoroughly</li>
                  <li>• False reports may result in account suspension</li>
                  <li>• We may contact you for additional information</li>
                  <li>• Reports are confidential and handled securely</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors font-medium"
              >
                Submit Fraud Report
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportFraud;
