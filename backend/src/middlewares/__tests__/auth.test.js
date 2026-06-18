const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { protect, authorize } = require('../auth');
const { setCsrfCookie } = require('../csrf');

jest.mock('jsonwebtoken');
jest.mock('../../models/User');
jest.mock('../csrf', () => ({
  setCsrfCookie: jest.fn(),
}));
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let next;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test_jwt_secret_value_123';
    next = jest.fn();
    mockReq = {
      cookies: {},
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    it('should return 401 if token is not provided in cookies or headers', async () => {
      await protect(mockReq, mockRes, next);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Access denied. Please log in to continue.',
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should authenticate successfully via Bearer token and NOT refresh CSRF cookie', async () => {
      mockReq.headers.authorization = 'Bearer valid_jwt_token';
      jwt.verify.mockReturnValue({ id: 'user123' });

      const mockUser = {
        _id: 'user123',
        isActive: true,
        role: 'user',
      };
      User.findById.mockResolvedValue(mockUser);

      await protect(mockReq, mockRes, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid_jwt_token', process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(mockReq.user).toEqual(mockUser);
      expect(setCsrfCookie).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should authenticate successfully via cookie and refresh/set CSRF cookie', async () => {
      mockReq.cookies.token = 'valid_session_cookie';
      jwt.verify.mockReturnValue({ id: 'user123' });

      const mockUser = {
        _id: 'user123',
        isActive: true,
        role: 'user',
      };
      User.findById.mockResolvedValue(mockUser);

      await protect(mockReq, mockRes, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid_session_cookie', process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(mockReq.user).toEqual(mockUser);
      expect(setCsrfCookie).toHaveBeenCalledWith('user123', mockRes, mockReq);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if account is not found in database', async () => {
      mockReq.cookies.token = 'valid_session_cookie';
      jwt.verify.mockReturnValue({ id: 'nonexistent' });
      User.findById.mockResolvedValue(null);

      await protect(mockReq, mockRes, next);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Account not found. Please log in again.',
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user account is inactive (suspended)', async () => {
      mockReq.cookies.token = 'valid_session_cookie';
      jwt.verify.mockReturnValue({ id: 'user123' });

      const mockUser = {
        _id: 'user123',
        isActive: false,
        banReason: 'Violation of Terms',
      };
      User.findById.mockResolvedValue(mockUser);

      await protect(mockReq, mockRes, next);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Account suspended: Violation of Terms',
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    it('should call next if user has allowed role', () => {
      mockReq.user = { role: 'admin' };
      const middleware = authorize('admin', 'partner');

      middleware(mockReq, mockRes, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user does not have allowed role', () => {
      mockReq.user = { role: 'user' };
      const middleware = authorize('admin', 'partner');

      middleware(mockReq, mockRes, next);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'You do not have permission to perform this action.',
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});
