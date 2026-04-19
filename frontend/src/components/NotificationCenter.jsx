import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import {
    BellIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, clearNotifications, isConnected } = useSocket();

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'error':
                return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />;
            default:
                return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBgColor = (type, read) => {
        if (read) return 'bg-white';
        switch (type) {
            case 'success':
                return 'bg-green-50';
            case 'error':
                return 'bg-red-50';
            case 'warning':
                return 'bg-amber-50';
            default:
                return 'bg-blue-50';
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative">
            {/* Notification Bell */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
            >
                <BellIcon className="w-6 h-6" />

                {/* Connection indicator */}
                <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`} />

                {/* Unread badge */}
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 top-12 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden z-50"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                                <div className="flex items-center gap-2">
                                    <BellIcon className="w-5 h-5" />
                                    <span className="font-semibold">Notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={clearNotifications}
                                            className="text-xs hover:underline"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Notifications List */}
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <div className="text-4xl mb-2">🔔</div>
                                        <p className="text-neutral-500">No notifications yet</p>
                                        <p className="text-sm text-neutral-400">
                                            You're all caught up!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-neutral-100">
                                        {notifications.map((notification) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                onClick={() => markAsRead(notification.id)}
                                                className={`p-4 cursor-pointer hover:bg-neutral-50 transition-colors ${getBgColor(notification.type, notification.read)
                                                    }`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        {getIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium ${notification.read ? 'text-neutral-600' : 'text-neutral-900'
                                                            }`}>
                                                            {notification.title}
                                                        </p>
                                                        <p className={`text-sm mt-0.5 ${notification.read ? 'text-neutral-400' : 'text-neutral-600'
                                                            }`}>
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-neutral-400 mt-1">
                                                            {formatTime(notification.timestamp)}
                                                        </p>
                                                    </div>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="p-3 bg-neutral-50 border-t border-neutral-100">
                                    <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
                                        View all notifications
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
