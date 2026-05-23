import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    let isMounted = true;

    const socketInstance = io(
      process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://api.tiffo.in',
      {
        auth: { userId: user?._id },
        withCredentials: true,
        transports: ['polling', 'websocket'],
      }
    );

    // Connection event handlers
    socketInstance.on('connect', () => {
      if (!isMounted) return;
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      if (!isMounted) return;
      setIsConnected(false);
    });

    socketInstance.on('connect_error', () => {
      if (!isMounted) return;
      setIsConnected(false);
    });

    // Notification listeners
    socketInstance.on('notification', (data) => {
      setNotifications((prev) => [data, ...prev]);

      const emoji =
        data.type === 'success'
          ? '✅'
          : data.type === 'error'
            ? '❌'
            : data.type === 'warning'
              ? '⚠️'
              : 'ℹ️';

      toast[data.type === 'error' ? 'error' : 'success'](`${emoji} ${data.message}`, {
        duration: 4000,
      });
    });

    socketInstance.on('order:update', (data) => {
      toast.success(`Order ${data.status}`, { duration: 3000 });
    });

    socketInstance.on('payment:update', (data) => {
      if (data.status === 'success') {
        toast.success('Payment successful!', { duration: 4000 });
      } else {
        toast.error('Payment failed', { duration: 4000 });
      }
    });

    socketInstance.on('delivery:update', (data) => {
      toast.success(`Delivery ${data.status}`, { duration: 3000 });
    });

    socketInstance.on('order:new', () => {
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
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
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
    clearNotifications,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketProvider;
