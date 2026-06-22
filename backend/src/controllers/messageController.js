const logger = require('../utils/logger');
const Message = require('../models/Message');
const User = require('../models/User');
const { emitToUser } = require('../services/socketService');

/**
 * Send a message
 */
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType, metadata } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Receiver and content are required',
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found',
      });
    }

    // Create conversation ID
    const conversation = Message.getConversationId(senderId, receiverId);

    // Create message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      conversation,
      content,
      messageType: messageType || 'text',
      metadata,
    });

    // Populate sender info
    await message.populate('sender', 'name avatar');

    // Emit real-time notification to receiver
    emitToUser(receiverId, 'message:new', {
      message: {
        _id: message._id,
        sender: message.sender,
        content: message.content,
        messageType: message.messageType,
        createdAt: message.createdAt,
      },
      conversation,
    });

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
    });
  }
};

/**
 * Get all conversations for current user
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get unique conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$conversation',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$read', false] }] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    // Get other user info for each conversation using batched query to fix N+1 issue
    const otherUserIds = conversations.map((conv) =>
      conv._id.split('_').find((id) => id !== userId.toString()),
    );
    const otherUsers = await User.find({ _id: { $in: otherUserIds } }).select(
      'name avatar email role',
    );
    const userMap = new Map(otherUsers.map((u) => [u._id.toString(), u]));

    const populatedConversations = conversations.map((conv) => {
      const otherUserId = conv._id.split('_').find((id) => id !== userId.toString());
      const otherUser = userMap.get(otherUserId) || null;

      return {
        conversationId: conv._id,
        otherUser,
        lastMessage: {
          content: conv.lastMessage.content,
          createdAt: conv.lastMessage.createdAt,
          isFromMe: conv.lastMessage.sender.toString() === userId.toString(),
        },
        unreadCount: conv.unreadCount,
      };
    });

    res.json({
      success: true,
      data: populatedConversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get messages in a conversation
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    // Verify user is part of this conversation
    const userIds = conversationId.split('_');
    if (!userIds.includes(userId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation',
      });
    }

    // ⚡ Bolt: Execute paginated find and count queries concurrently
    const [messages, total] = await Promise.all([
      Message.find({ conversation: conversationId })
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Message.countDocuments({ conversation: conversationId }),
    ]);

    res.json({
      success: true,
      data: messages.reverse(), // Oldest first for chat display
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Mark messages as read
 */
const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: userId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      },
    );

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get unread message count
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Message.countDocuments({
      receiver: userId,
      read: false,
    });

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  getUnreadCount,
};
