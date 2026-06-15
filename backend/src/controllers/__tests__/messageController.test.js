const { sendMessage } = require('../messageController');
const Message = require('../../models/Message');
const User = require('../../models/User');
const socketService = require('../../services/socketService');

jest.mock('../../models/Message');
jest.mock('../../models/User');
jest.mock('../../services/socketService', () => ({
  emitToUser: jest.fn(),
}));
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Message Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      user: { _id: 'sender_id' },
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should return 400 when receiverId is missing', async () => {
      mockReq.body = { content: 'Hello' };

      await sendMessage(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Receiver and content are required',
      });
    });

    it('should return 400 when content is missing', async () => {
      mockReq.body = { receiverId: 'receiver_id' };

      await sendMessage(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Receiver and content are required',
      });
    });

    it('should return 404 when receiver does not exist', async () => {
      mockReq.body = { receiverId: 'receiver_id', content: 'Hello' };
      User.findById.mockResolvedValue(null);

      await sendMessage(mockReq, mockRes);

      expect(User.findById).toHaveBeenCalledWith('receiver_id');
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Receiver not found',
      });
    });

    it('should return 201 and send a message when successful', async () => {
      mockReq.body = { receiverId: 'receiver_id', content: 'Hello' };

      const mockReceiver = { _id: 'receiver_id', name: 'Receiver' };
      const mockMessage = {
        _id: 'message_id',
        sender: 'sender_id',
        receiver: 'receiver_id',
        content: 'Hello',
        messageType: 'text',
        createdAt: new Date(),
        populate: jest.fn().mockResolvedValue(),
      };

      User.findById.mockResolvedValue(mockReceiver);
      Message.getConversationId = jest.fn().mockReturnValue('sender_id_receiver_id');
      Message.create.mockResolvedValue(mockMessage);

      await sendMessage(mockReq, mockRes);

      expect(User.findById).toHaveBeenCalledWith('receiver_id');
      expect(Message.getConversationId).toHaveBeenCalledWith('sender_id', 'receiver_id');
      expect(Message.create).toHaveBeenCalledWith({
        sender: 'sender_id',
        receiver: 'receiver_id',
        conversation: 'sender_id_receiver_id',
        content: 'Hello',
        messageType: 'text',
        metadata: undefined,
      });
      expect(mockMessage.populate).toHaveBeenCalledWith('sender', 'name avatar');
      expect(socketService.emitToUser).toHaveBeenCalledWith('receiver_id', 'message:new', {
        message: {
          _id: mockMessage._id,
          sender: mockMessage.sender,
          content: mockMessage.content,
          messageType: mockMessage.messageType,
          createdAt: mockMessage.createdAt,
        },
        conversation: 'sender_id_receiver_id',
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockMessage,
      });
    });

    it('should return 500 when User.findById throws an error', async () => {
      mockReq.body = { receiverId: 'receiver_id', content: 'Hello' };
      const errorMessage = 'Database error';
      User.findById.mockRejectedValue(new Error(errorMessage));

      await sendMessage(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to send message',
      });
    });

    it('should return 500 when Message.create throws an error', async () => {
      mockReq.body = { receiverId: 'receiver_id', content: 'Hello' };
      const mockReceiver = { _id: 'receiver_id', name: 'Receiver' };
      User.findById.mockResolvedValue(mockReceiver);
      Message.getConversationId = jest.fn().mockReturnValue('sender_id_receiver_id');

      const errorMessage = 'Failed to create message';
      Message.create.mockRejectedValue(new Error(errorMessage));

      await sendMessage(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to send message',
      });
    });
  });
});
