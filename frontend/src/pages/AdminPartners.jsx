import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  XMarkIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AdminPartners = () => {
  const [partners, setPartners] = useState([]);
  const [pendingPartners, setPendingPartners] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const [pendingRes, verifiedRes] = await Promise.all([
        api.get('/admin/partners/pending'),
        api.get('/admin/users?role=partner&status=verified&limit=100'), // Fetch max 100 for simplicity
      ]);

      if (pendingRes.data.success) {
        setPendingPartners(pendingRes.data.data || []);
      }
      if (verifiedRes.data.success) {
        setPartners(verifiedRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error('Failed to load partners data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (partnerId) => {
    try {
      const response = await api.patch(`/admin/partners/${partnerId}/status`, {
        status: 'approved',
      });
      if (response.data.success) {
        toast.success('Partner approved');
        loadPartners();
      }
    } catch (error) {
      toast.error('Failed to approve partner');
    }
    setShowModal(false);
  };

  const handleReject = async (partnerId) => {
    try {
      const response = await api.patch(`/admin/partners/${partnerId}/status`, {
        status: 'rejected',
        reason: 'Admin rejected application',
      });
      if (response.data.success) {
        toast.success('Partner rejected');
        loadPartners();
      }
    } catch (error) {
      toast.error('Failed to reject partner');
    }
    setShowModal(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-[110px] pb-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </Link>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <BuildingStorefrontIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Partner Management</h1>
                <p className="text-white/80 text-sm">{pendingPartners.length} pending approvals</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-2 mb-6 -mt-12 flex"
        >
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-white shadow-lg'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <ClockIcon className="w-5 h-5" />
            Pending ({pendingPartners.length})
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'verified'
                ? 'bg-green-500 text-white shadow-lg'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <CheckCircleIcon className="w-5 h-5" />
            Verified ({partners.length})
          </button>
        </motion.div>

        {/* Pending Partners */}
        <AnimatePresence mode="wait">
          {activeTab === 'pending' && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {pendingPartners.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-neutral-700">All caught up!</h3>
                  <p className="text-neutral-500">No pending partner applications</p>
                </div>
              ) : (
                pendingPartners.map((partner, index) => (
                  <motion.div
                    key={partner._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden"
                  >
                    <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                            {partner.businessName?.charAt(0) || partner.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-neutral-900">
                              {partner.businessName || partner.name || 'Unknown Partner'}
                            </h3>
                            <p className="text-neutral-500">{partner.name}</p>
                            <div className="flex items-center gap-3 mt-2 text-sm text-neutral-600">
                              <span className="flex items-center gap-1">
                                <MapPinIcon className="w-4 h-4" />
                                {partner.address}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                          Pending Review
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <EnvelopeIcon className="w-4 h-4" />
                          {partner.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <PhoneIcon className="w-4 h-4" />
                          {partner.phone}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-sm text-neutral-500">Documents:</span>
                        {partner.documents?.map((doc, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-lg text-sm"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>

                      <div className="mt-6 flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleApprove(partner._id)}
                          className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleReject(partner._id)}
                          className="flex-1 py-3 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircleIcon className="w-5 h-5" />
                          Reject
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedPartner(partner);
                            setShowModal(true);
                          }}
                          className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
                        >
                          View Details
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'verified' && (
            <motion.div
              key="verified"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {partners.map((partner, index) => (
                <motion.div
                  key={partner._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden"
                >
                  <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                        {partner.businessName?.charAt(0) || partner.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-neutral-900">
                            {partner.businessName || partner.name || 'Unknown Partner'}
                          </h3>
                          <CheckBadgeIcon className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-sm text-neutral-500">{partner.address}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <StarIcon className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-medium">{partner.rating || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-neutral-50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-neutral-900">
                          {partner.totalOrders || 0}
                        </p>
                        <p className="text-sm text-neutral-500">Orders</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(partner.totalEarnings || 0)}
                        </p>
                        <p className="text-sm text-neutral-500">Earnings</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Partner Detail Modal */}
      <AnimatePresence>
        {showModal && selectedPartner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{selectedPartner.businessName}</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-neutral-600">
                    <EnvelopeIcon className="w-5 h-5" />
                    {selectedPartner.email}
                  </div>
                  <div className="flex items-center gap-3 text-neutral-600">
                    <PhoneIcon className="w-5 h-5" />
                    {selectedPartner.phone}
                  </div>
                  <div className="flex items-center gap-3 text-neutral-600">
                    <MapPinIcon className="w-5 h-5" />
                    {selectedPartner.address}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleApprove(selectedPartner._id)}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium"
                  >
                    Approve Partner
                  </button>
                  <button
                    onClick={() => handleReject(selectedPartner._id)}
                    className="flex-1 py-3 bg-red-100 text-red-700 rounded-xl font-medium"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPartners;
