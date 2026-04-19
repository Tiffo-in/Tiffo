import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import {
    ShieldExclamationIcon,
    MagnifyingGlassIcon,
    ExclamationTriangleIcon,
    CheckBadgeIcon,
    NoSymbolIcon
} from '@heroicons/react/24/outline';

const AdminFraud = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [filter, setFilter] = useState('all');

    const loadReports = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/fraud', {
                params: { page, limit: 10, status: filter }
            });
            if (res.data.success) {
                setReports(res.data.data);
                setPagination(res.data.pagination);
            }
        } catch (error) {
            toast.error('Failed to connect to backend fraud service');
        } finally {
            setLoading(false);
        }
    }, [page, filter]);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await api.put(`/fraud/${id}/status`, { status: newStatus });
            if (res.data.success) {
                toast.success(`Report marked as ${newStatus.replace('_', ' ')}`);
                setReports(reports.map(r => r._id === id ? { ...r, status: newStatus } : r));
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'open': return 'bg-red-100 text-red-800 border-red-200';
            case 'under_investigation': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'action_taken': return 'bg-green-100 text-green-800 border-green-200';
            case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'open': return <ExclamationTriangleIcon className="w-4 h-4 mr-1" />;
            case 'under_investigation': return <MagnifyingGlassIcon className="w-4 h-4 mr-1" />;
            case 'action_taken': return <CheckBadgeIcon className="w-4 h-4 mr-1" />;
            case 'dismissed': return <NoSymbolIcon className="w-4 h-4 mr-1" />;
            default: return <ShieldExclamationIcon className="w-4 h-4 mr-1" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                            <ShieldExclamationIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Fraud Reports</h1>
                            <p className="text-gray-500">Monitor and investigate platform abuse</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex gap-2 overflow-x-auto">
                    {['all', 'open', 'under_investigation', 'action_taken', 'dismissed'].map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setPage(1); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                                filter === f ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Loading reports...</div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No fraud reports found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 font-semibold text-gray-600">Reporter</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600">Details</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 w-1/4">Description</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-center">Status</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report, i) => (
                                        <motion.tr 
                                            key={report._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{report.reporterName}</div>
                                                <div className="text-sm text-gray-500">{report.reporterEmail}</div>
                                                {report.reporterPhone && (
                                                    <div className="text-xs text-gray-400 mt-1">{report.reporterPhone}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold capitalize text-red-700 bg-red-50 inline-block px-2 py-0.5 rounded mb-1">
                                                    {report.fraudType.replace('_', ' ')}
                                                </div>
                                                {report.partnerName && <div className="text-sm text-gray-700">Partner: {report.partnerName}</div>}
                                                {report.orderId && <div className="text-sm text-gray-500 font-mono">Order: {report.orderId}</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-600 text-sm line-clamp-3" title={report.description}>
                                                    {report.description}
                                                </p>
                                                {report.evidence && (
                                                    <p className="text-xs text-blue-500 mt-2 italic">Has Evidence</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center justify-center px-3 py-1 rounded-full border text-xs font-semibold capitalize whitespace-nowrap ${getStatusStyle(report.status)}`}>
                                                    {getStatusIcon(report.status)}
                                                    {report.status.replace('_', ' ')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <select
                                                    value={report.status}
                                                    onChange={(e) => updateStatus(report._id, e.target.value)}
                                                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-red-500 outline-none cursor-pointer"
                                                >
                                                    <option value="open">Open</option>
                                                    <option value="under_investigation">Investigating</option>
                                                    <option value="action_taken">Action Taken</option>
                                                    <option value="dismissed">Dismissed</option>
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

export default AdminFraud;
