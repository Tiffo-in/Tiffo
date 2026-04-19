import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import {
    ChatBubbleLeftRightIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    ClockIcon,
    ArchiveBoxIcon
} from '@heroicons/react/24/outline';

const AdminSupport = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [filter, setFilter] = useState('all');

    const loadTickets = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/support', {
                params: { page, limit: 10, status: filter }
            });
            if (res.data.success) {
                setTickets(res.data.data);
                setPagination(res.data.pagination);
            }
        } catch (error) {
            toast.error('Failed to connect to backend support service');
        } finally {
            setLoading(false);
        }
    }, [page, filter]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await api.put(`/support/${id}/status`, { status: newStatus });
            if (res.data.success) {
                toast.success(`Ticket marked as ${newStatus}`);
                setTickets(tickets.map(t => t._id === id ? { ...t, status: newStatus } : t));
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'investigating': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
            case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <ClockIcon className="w-4 h-4 mr-1" />;
            case 'investigating': return <ExclamationCircleIcon className="w-4 h-4 mr-1" />;
            case 'resolved': return <CheckCircleIcon className="w-4 h-4 mr-1" />;
            case 'closed': return <ArchiveBoxIcon className="w-4 h-4 mr-1" />;
            default: return <ClockIcon className="w-4 h-4 mr-1" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <ChatBubbleLeftRightIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
                            <p className="text-gray-500">Manage user inquiries and help requests</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex gap-2">
                    {['all', 'pending', 'investigating', 'resolved', 'closed'].map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setPage(1); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                                filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Loading tickets...</div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No support tickets found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 font-semibold text-gray-600">User</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600">Subject</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 w-1/3">Message</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-center">Status</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((ticket, i) => (
                                        <motion.tr 
                                            key={ticket._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{ticket.name}</div>
                                                <div className="text-sm text-gray-500">{ticket.email}</div>
                                            </td>
                                            <td className="px-6 py-4 capitalize font-medium text-gray-700">
                                                {ticket.subject}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-600 text-sm line-clamp-2" title={ticket.message}>
                                                    {ticket.message}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center justify-center px-3 py-1 rounded-full border text-xs font-semibold capitalize ${getStatusStyle(ticket.status)}`}>
                                                    {getStatusIcon(ticket.status)}
                                                    {ticket.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <select
                                                    value={ticket.status}
                                                    onChange={(e) => updateStatus(ticket._id, e.target.value)}
                                                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="investigating">Investigating</option>
                                                    <option value="resolved">Resolved</option>
                                                    <option value="closed">Closed</option>
                                                </select>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div className="flex justify-between items-center p-4 border-t border-gray-100">
                            <span className="text-sm text-gray-500">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1 rounded border disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                    disabled={page === pagination.pages}
                                    className="px-3 py-1 rounded border disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSupport;
