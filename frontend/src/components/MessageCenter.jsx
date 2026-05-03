import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChatBubbleLeftRightIcon,
    XMarkIcon,
    PaperAirplaneIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';

const MessageCenter = ({ isOpen, onClose }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { on, isConnected } = useSocket();

    // Get current user from Redux (single source of truth)
    const { user: currentUser } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isOpen) {
            loadConversations();
        }
    }, [isOpen]);

    useEffect(() => {
        // Listen for new messages
        const unsubscribe = on('message:new', (data) => {
            if (selectedConversation === data.conversation) {
                setMessages(prev => [...prev, data.message]);
                scrollToBottom();
            }
            // Update conversation list
            loadConversations();
        });
        return unsubscribe;
    }, [on, selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        try {
            const response = await api.get('/messages/conversations');
            if (response.data.success) {
                setConversations(response.data.data || []);
            }
        } catch (error) {
            console.error('Error loading conversations', error);
        }
    };

    const loadMessages = async (conversationId) => {
        setLoading(true);
        try {
            const response = await api.get(`/messages/${conversationId}`);
            if (response.data.success) {
                setMessages(response.data.data || []);
                await api.patch(`/messages/${conversationId}/read`);
                loadConversations();
            }
        } catch (error) {
            console.error('Error loading messages', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConversationClick = (conv) => {
        setSelectedConversation(conv.conversationId);
        loadMessages(conv.conversationId);
    };

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const currentConv = conversations.find(c => c.conversationId === selectedConversation);
        if (!currentConv) return;

        const originalMessageText = newMessage;
        setNewMessage('');

        // Optimistic UI update
        const tempMsg = {
            _id: Date.now().toString(),
            sender: { _id: currentUser.id, name: currentUser.name },
            content: originalMessageText,
            createdAt: new Date()
        };
        setMessages(prev => [...prev, tempMsg]);
        scrollToBottom();

        try {
            const receiverId = currentConv.otherUser._id;
            const response = await api.post('/messages', {
                receiverId,
                content: originalMessageText
            });

            if (!response.data.success) {
                console.error('Failed to send message');
                // Revert optimistic update
                setMessages(prev => prev.filter(m => m._id !== tempMsg._id));
            } else {
                // Ensure proper sync with server message
                setMessages(prev => prev.map(m => m._id === tempMsg._id ? response.data.data : m));
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => prev.filter(m => m._id !== tempMsg._id));
        }
    };

    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;

        if (diff < 86400000) {
            return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else if (diff < 604800000) {
            return d.toLocaleDateString('en-US', { weekday: 'short' });
        }
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden"
                >
                    {/* Conversations List */}
                    <div className="w-80 border-r border-neutral-200 flex flex-col">
                        <div className="p-4 border-b border-neutral-200 bg-gradient-to-r from-primary-500 to-primary-600">
                            <div className="flex items-center justify-between text-white">
                                <div className="flex items-center gap-2">
                                    <ChatBubbleLeftRightIcon className="w-6 h-6" />
                                    <h2 className="font-bold text-lg">Messages</h2>
                                </div>
                                <div className={`flex items-center gap-1 text-xs ${isConnected ? 'text-green-300' : 'text-red-300'}`}>
                                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                                    {isConnected ? 'Live' : 'Offline'}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {conversations.map((conv) => (
                                <motion.div
                                    key={conv.conversationId}
                                    whileHover={{ backgroundColor: '#f5f5f5' }}
                                    onClick={() => handleConversationClick(conv)}
                                    className={`p-4 border-b border-neutral-100 cursor-pointer ${selectedConversation === conv.conversationId ? 'bg-primary-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold">
                                            {conv.otherUser.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-neutral-900 truncate">{conv.otherUser.name}</span>
                                                <span className="text-xs text-neutral-400">{formatTime(conv.lastMessage.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-sm text-neutral-500 truncate">
                                                    {conv.lastMessage.isFromMe && <span className="text-neutral-400">You: </span>}
                                                    {conv.lastMessage.content}
                                                </p>
                                                {conv.unreadCount > 0 && (
                                                    <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`text-xs ${conv.otherUser.role === 'partner' ? 'text-green-600' : 'text-blue-600'}`}>
                                                {conv.otherUser.role === 'partner' ? '👨‍🍳 Partner' : '👤 Customer'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col">
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold">
                                            {conversations.find(c => c.conversationId === selectedConversation)?.otherUser.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-neutral-900">
                                                {conversations.find(c => c.conversationId === selectedConversation)?.otherUser.name}
                                            </h3>
                                            <span className="text-xs text-green-500">Online</span>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg">
                                        <XMarkIcon className="w-5 h-5 text-neutral-500" />
                                    </button>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 bg-neutral-50 space-y-4">
                                    {messages.map((msg) => {
                                        const isMe = msg.sender._id === currentUser.id;
                                        return (
                                            <motion.div
                                                key={msg._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${isMe
                                                        ? 'bg-primary-500 text-white rounded-br-md'
                                                        : 'bg-white text-neutral-900 shadow-sm rounded-bl-md'
                                                    }`}>
                                                    <p>{msg.content}</p>
                                                    <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-neutral-400'}`}>
                                                        {formatTime(msg.createdAt)}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-4 border-t border-neutral-200 bg-white">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                            placeholder="Type a message..."
                                            className="flex-1 px-4 py-3 bg-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleSend}
                                            className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                                        >
                                            <PaperAirplaneIcon className="w-5 h-5" />
                                        </motion.button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center bg-neutral-50">
                                <div className="text-center">
                                    <ChatBubbleLeftRightIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-neutral-600">Select a conversation</h3>
                                    <p className="text-neutral-400">Choose a chat from the list to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MessageCenter;
