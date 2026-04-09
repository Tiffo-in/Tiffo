const { login, register, logout } = require('../authController');
const User = require('../../models/User');

jest.mock('../../models/User');
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

describe('Auth Controller', () => {
  let mockReq;
  let mockRes;
  let mockCookie;

  beforeEach(() => {
    mockCookie = jest.fn().mockReturnThis();
    mockReq = {
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: mockCookie
    };
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_EXPIRE = '30d';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return 400 if user does not exist', async () => {
      mockReq.body = { email: 'test@test.com', password: 'password' };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null) // User not found
      });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Invalid credentials'
      }));
    });

    it('should return 400 if password does not match', async () => {
      mockReq.body = { email: 'test@test.com', password: 'password' };
      const mockUser = {
        _id: '123',
        comparePassword: jest.fn().mockResolvedValue(false)
      };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Invalid credentials'
      }));
    });

    it('should return 200 and set token cookie on successful login', async () => {
      mockReq.body = { email: 'test@test.com', password: 'password' };
      const mockUser = {
        _id: '123',
        name: 'Test',
        email: 'test@test.com',
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(true)
      };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.cookie).toHaveBeenCalledWith('token', expect.any(String), expect.objectContaining({
        httpOnly: true
      }));
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        user: expect.objectContaining({ email: 'test@test.com' })
      }));
    });
  });

  describe('logout', () => {
    it('should return 200 and clear the token cookie', () => {
      logout(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.cookie).toHaveBeenCalledWith('token', 'none', expect.objectContaining({
        httpOnly: true
      }));
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true
      }));
    });
  });
});
