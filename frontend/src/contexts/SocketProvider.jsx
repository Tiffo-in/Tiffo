import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Get auth token from localStorage
        const token = localStorage.getItem('token');

        let isMounted = true;

        // Create socket connection
        // Use polling first so the HTTP handshake completes before upgrading to WS.
        // This is the default Socket.io order and avoids "closed before established" errors.
        const socketInstance = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5001', {
            auth: {
                token: token || ''
            },
            transports: ['polling', 'websocket']
        });

        // Connection event handlers
        socketInstance.on('connect', () => {
            if (!isMounted) return;
            console.log('🔌 Socket connected:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            if (!isMounted) return;
            console.log('🔌 Socket disconnected');
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            if (!isMounted) return;
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        // Notification listeners
        socketInstance.on('notification', (data) => {
            console.log('🔔 Notification received:', data);
            setNotifications(prev => [data, ...prev]);

            // Show toast notification
            const emoji = data.type === 'success' ? '✅' :
                data.type === 'error' ? '❌' :
                    data.type === 'warning' ? '⚠️' : 'ℹ️';

            toast[data.type === 'error' ? 'error' : 'success'](
                `${emoji} ${data.message}`,
                { duration: 4000 }
            );
        });

        socketInstance.on('order:update', (data) => {
            console.log('📦 Order update:', data);
            toast.success(`Order ${data.status}`, { duration: 3000 });
        });

        socketInstance.on('payment:update', (data) => {
            console.log('💰 Payment update:', data);
            if (data.status === 'success') {
                toast.success('Payment successful!', { duration: 4000 });
            } else {
                toast.error('Payment failed', { duration: 4000 });
            }
        });

        socketInstance.on('delivery:update', (data) => {
            console.log('🚴 Delivery update:', data);
            toast.success(`Delivery ${data.status}`, { duration: 3000 });
        });

        socketInstance.on('order:new', (data) => {
            console.log('📦 New order:', data);
            toast.success('New order received!', { duration: 5000 });
        });

        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            isMounted = false;
            // Only disconnect if the socket has actually connected.
            // Calling disconnect() in CONNECTING state causes the
            // "WebSocket closed before established" error in React StrictMode.
            if (socketInstance.connected) {
                socketInstance.disconnect();
            } else {
                socketInstance.off();
                socketInstance.close();
            }
        };
    }, []);

    const joinRoom = (room) => {
        if (socket) {
            socket.emit(`join:${room.type}`, room.id);
        }
    };

    const leaveRoom = (room) => {
        if (socket) {
            socket.emit(`leave:${room.type}`, room.id);
        }
    };

    const markNotificationAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const value = {
        socket,
        isConnected,
        notifications,
        joinRoom,
        leaveRoom,
        markNotificationAsRead,
        clearNotifications
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;
