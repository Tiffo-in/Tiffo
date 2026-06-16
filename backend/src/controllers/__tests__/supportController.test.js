const {
  createSupportRequest,
  getSupportRequests,
  updateSupportStatus,
} = require('../supportController');
const SupportRequest = require('../../models/SupportRequest');

jest.mock('../../models/SupportRequest');

describe('Support Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('createSupportRequest', () => {
    it('should create a support request without userId if not logged in', async () => {
      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'order',
        message: 'Where is my order?',
      };

      const mockCreatedRequest = { ...mockReq.body, _id: 'request123', status: 'pending' };
      SupportRequest.create.mockResolvedValue(mockCreatedRequest);

      await createSupportRequest(mockReq, mockRes, mockNext);

      expect(SupportRequest.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'order',
        message: 'Where is my order?',
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedRequest,
        message: 'Support request submitted successfully',
      });
    });

    it('should attach userId to the support request if user is logged in', async () => {
      mockReq.body = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'payment',
        message: 'Payment failed',
      };
      mockReq.user = { _id: 'user123' };

      const mockCreatedRequest = {
        ...mockReq.body,
        userId: 'user123',
        _id: 'request124',
        status: 'pending',
      };
      SupportRequest.create.mockResolvedValue(mockCreatedRequest);

      await createSupportRequest(mockReq, mockRes, mockNext);

      expect(SupportRequest.create).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'payment',
        message: 'Payment failed',
        userId: 'user123',
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedRequest,
        message: 'Support request submitted successfully',
      });
    });

    it('should pass error to next middleware if creation fails', async () => {
      const error = new Error('Database error');
      SupportRequest.create.mockRejectedValue(error);

      await createSupportRequest(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getSupportRequests', () => {
    it('should fetch all support requests with default pagination', async () => {
      const mockRequests = [{ _id: 'req1' }, { _id: 'req2' }];
      SupportRequest.countDocuments.mockResolvedValue(2);
      SupportRequest.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockRequests),
      });

      await getSupportRequests(mockReq, mockRes, mockNext);

      expect(SupportRequest.countDocuments).toHaveBeenCalledWith({});
      expect(SupportRequest.find).toHaveBeenCalledWith({});
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          pages: 1,
        },
        data: mockRequests,
      });
    });

    it('should apply status filter if provided in query', async () => {
      mockReq.query = { status: 'resolved', page: '2', limit: '5' };
      const mockRequests = [{ _id: 'req3' }];
      SupportRequest.countDocuments.mockResolvedValue(1);

      const skipMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockResolvedValue(mockRequests);

      SupportRequest.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: skipMock,
        limit: limitMock,
      });

      await getSupportRequests(mockReq, mockRes, mockNext);

      expect(SupportRequest.countDocuments).toHaveBeenCalledWith({ status: 'resolved' });
      expect(SupportRequest.find).toHaveBeenCalledWith({ status: 'resolved' });

      // page 2, limit 5 => skip (2-1)*5 = 5
      expect(skipMock).toHaveBeenCalledWith(5);
      expect(limitMock).toHaveBeenCalledWith(5);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        pagination: {
          page: 2,
          limit: 5,
          total: 1,
          pages: 1,
        },
        data: mockRequests,
      });
    });

    it('should pass error to next middleware if fetching fails', async () => {
      const error = new Error('Database error');
      SupportRequest.countDocuments.mockRejectedValue(error);

      await getSupportRequests(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateSupportStatus', () => {
    it('should return 400 if an invalid status is provided', async () => {
      mockReq.params = { id: 'req1' };
      mockReq.body = { status: 'invalid_status' };

      await updateSupportStatus(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid status value',
      });
      expect(SupportRequest.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should return 404 if the support request is not found', async () => {
      mockReq.params = { id: 'req_not_found' };
      mockReq.body = { status: 'resolved' };

      SupportRequest.findByIdAndUpdate.mockResolvedValue(null);

      await updateSupportStatus(mockReq, mockRes, mockNext);

      expect(SupportRequest.findByIdAndUpdate).toHaveBeenCalledWith(
        'req_not_found',
        { status: 'resolved' },
        { new: true, runValidators: true },
      );
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Support request not found',
      });
    });

    it('should update the status and return 200 on success', async () => {
      mockReq.params = { id: 'req1' };
      mockReq.body = { status: 'investigating' };

      const mockUpdatedRequest = { _id: 'req1', status: 'investigating' };
      SupportRequest.findByIdAndUpdate.mockResolvedValue(mockUpdatedRequest);

      await updateSupportStatus(mockReq, mockRes, mockNext);

      expect(SupportRequest.findByIdAndUpdate).toHaveBeenCalledWith(
        'req1',
        { status: 'investigating' },
        { new: true, runValidators: true },
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedRequest,
        message: 'Support request marked as investigating',
      });
    });

    it('should pass error to next middleware if update fails', async () => {
      mockReq.params = { id: 'req1' };
      mockReq.body = { status: 'closed' };

      const error = new Error('Database error');
      SupportRequest.findByIdAndUpdate.mockRejectedValue(error);

      await updateSupportStatus(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
