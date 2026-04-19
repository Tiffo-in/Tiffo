import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5005';

/**
 * Custom hook for Socket.io connection and event handling
 */
export const useSocket = () => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Get token from localStorage
        const token = localStorage.getItem('token');

        // Initialize socket connection
        socketRef.current = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        const socket = socketRef.current;

        // Connection events
        socket.on('connect', () => {
            console.log('🔌 Socket connected:', socket.id);
            setIsConnected(true);
        });

        socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        // Handle notifications
        socket.on('notification', (notification) => {
            setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
        });

        socket.on('notification:broadcast', (notification) => {
            setNotifications(prev => [notification, ...prev].slice(0, 50));
        });

        // Cleanup on unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    // Join a specific room
    const joinRoom = useCallback((room, id) => {
        if (socketRef.current) {
            socketRef.current.emit(`join:${room}`, id);
        }
    }, []);

    // Leave a specific room
    const leaveRoom = useCallback((room, id) => {
        if (socketRef.current) {
            socketRef.current.emit(`leave:${room}`, id);
        }
    }, []);

    // Subscribe to specific event
    const on = useCallback((event, callback) => {
        if (socketRef.current) {
            socketRef.current.on(event, callback);
        }
        return () => {
            if (socketRef.current) {
                socketRef.current.off(event, callback);
            }
        };
    }, []);

    // Emit event
    const emit = useCallback((event, data) => {
        if (socketRef.current) {
            socketRef.current.emit(event, data);
        }
    }, []);

    // Mark notification as read
    const markAsRead = useCallback((notificationId) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
    }, []);

    // Clear all notifications
    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    return {
        socket: socketRef.current,
        isConnected,
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
        joinRoom,
        leaveRoom,
        on,
        emit,
        markAsRead,
        clearNotifications
    };
};

export default useSocket;
