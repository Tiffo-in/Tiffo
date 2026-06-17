import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  BellAlertIcon,
  ShieldCheckIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState(null);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  useEffect(() => {
    setShowBulkActions(selectedIds.length > 0);
  }, [selectedIds]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const queryString = roleFilter !== 'all' ? `?role=${roleFilter}` : '';
      const response = await api.get(`/admin/users${queryString}`);
      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUsers.map((u) => u._id));
    }
  };

  const toggleSelect = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleBulkAction = async (action) => {
    setBulkAction(action);
    try {
      const message =
        action === 'notify' || action === 'ban'
          ? window.prompt(`Enter message for ${action}:`, `Admin bulk ${action}`)
          : undefined;
      if ((action === 'notify' || action === 'ban') && message === null) {
        setBulkAction(null);
        return; // User cancelled
      }
      const response = await api.post('/admin/users/bulk', {
        userIds: selectedIds,
        action,
        message,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        loadUsers();
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error(error.response?.data?.message || 'Failed to perform bulk action');
    } finally {
      setSelectedIds([]);
      setBulkAction(null);
    }
  };

  const handleBanUser = async () => {
    try {
      const newStatus = selectedUser.isActive === false ? 'active' : 'banned';
      const reason =
        newStatus === 'banned'
          ? window.prompt('Enter ban reason:', 'Violation of terms')
          : 'Admin unban';
      if (newStatus === 'banned' && reason === null) return;
      const response = await api.patch(`/admin/users/${selectedUser._id}/status`, {
        status: newStatus,
        reason,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        loadUsers();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Ban user error:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleSendMessage = async () => {
    const messageText = window.prompt('Enter message to send to user:');
    if (!messageText) return;
    try {
      const response = await api.post('/messages', {
        receiverId: selectedUser._id,
        content: messageText,
      });
      if (response.data.success) {
        toast.success('Message sent successfully');
        setShowModal(false);
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    }
  };

  const exportToCSV = () => {
    setExporting(true);
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Verified', 'Joined Date'];
    const rows = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.phone,
      user.role,
      user.isVerified ? 'Yes' : 'No',
      new Date(user.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setExporting(false);
  };

  const getRoleBadge = (role) => {
    const config = {
      user: { color: 'bg-blue-100 text-blue-700', label: 'Customer' },
      partner: { color: 'bg-green-100 text-green-700', label: 'Partner' },
      admin: { color: 'bg-purple-100 text-purple-700', label: 'Admin' },
    };
    return config[role] || config.user;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 relative overflow-hidden">
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
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">User Management</h1>
                <p className="text-white/80 text-sm">{users.length} users found</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/admin/analytics"
                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-colors"
              >
                📊 Analytics
              </Link>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={exportToCSV}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-colors"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                {exporting ? 'Exporting...' : 'Export CSV'}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {showBulkActions && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-neutral-900 text-white py-3 px-4 sticky top-0 z-40"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-semibold">{selectedIds.length} selected</span>
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-sm text-neutral-400 hover:text-white"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBulkAction('verify')}
                  disabled={bulkAction === 'verify'}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <ShieldCheckIcon className="w-4 h-4" />
                  {bulkAction === 'verify' ? 'Verifying...' : 'Verify'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBulkAction('notify')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <BellAlertIcon className="w-4 h-4" />
                  Notify
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBulkAction('ban')}
                  disabled={bulkAction === 'ban'}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <NoSymbolIcon className="w-4 h-4" />
                  {bulkAction === 'ban' ? 'Banning...' : 'Ban'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBulkAction('delete')}
                  disabled={bulkAction === 'delete'}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  {bulkAction === 'delete' ? 'Deleting...' : 'Delete'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white rounded-2xl shadow-lg border border-neutral-100 p-4 mb-6 ${showBulkActions ? '' : '-mt-12'}`}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'user', 'partner'].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    roleFilter === role
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {role === 'all' ? 'All' : role === 'user' ? 'Customers' : 'Partners'}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === filteredUsers.length && filteredUsers.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded border-neutral-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-600">User</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-600">Contact</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-600">Role</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-600">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-600">Stats</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => {
                  const roleBadge = getRoleBadge(user.role);
                  const isSelected = selectedIds.includes(user._id);
                  return (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-b border-neutral-100 transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-neutral-50'}`}
                    >
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(user._id)}
                          className="w-4 h-4 text-blue-600 rounded border-neutral-300 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-neutral-900">{user.name}</span>
                              {user.isVerified && (
                                <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                            <span className="text-sm text-neutral-500">
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <EnvelopeIcon className="w-4 h-4" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <PhoneIcon className="w-4 h-4" />
                            {user.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${roleBadge.color}`}
                        >
                          {roleBadge.label}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {user.isActive === false ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <NoSymbolIcon className="w-5 h-5" />
                            Banned
                          </span>
                        ) : user.isVerified ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircleIcon className="w-5 h-5" />
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600">
                            <XCircleIcon className="w-5 h-5" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {user.role === 'user' ? (
                          <div className="text-sm">
                            <div className="text-neutral-600">
                              {user.subscriptions || 0} subscriptions
                            </div>
                            <div className="font-medium text-green-600">
                              ₹{user.totalSpent || 0}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedUser(user);
                            setShowModal(true);
                          }}
                          className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                        >
                          View
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {showModal && selectedUser && (
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
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
                      {selectedUser.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                      <p className="text-white/80">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <p className="text-sm text-neutral-500">Role</p>
                    <p className="font-bold text-neutral-900 capitalize">{selectedUser.role}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <p className="text-sm text-neutral-500">Status</p>
                    <p
                      className={`font-bold ${selectedUser.isActive === false ? 'text-red-600' : selectedUser.isVerified ? 'text-green-600' : 'text-amber-600'}`}
                    >
                      {selectedUser.isActive === false
                        ? 'Banned'
                        : selectedUser.isVerified
                          ? 'Verified'
                          : 'Pending'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleBanUser}
                    className={`flex-1 py-3 ${selectedUser.isActive === false ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'} rounded-xl font-medium transition-colors`}
                  >
                    {selectedUser.isActive === false ? 'Unban User' : 'Ban User'}
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                  >
                    Send Message
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

export default AdminUsers;
