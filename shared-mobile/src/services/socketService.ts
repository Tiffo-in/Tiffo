import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

declare const __DEV__: boolean;

const SOCKET_URL = 'https://api.tiffo.in';

let socket: Socket | null = null;

export const initSocket = async (tokenKey: string) => {
  if (socket?.connected) return socket;

  const token = await AsyncStorage.getItem(tokenKey);
  if (!token) return null;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
