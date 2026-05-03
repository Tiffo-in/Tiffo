const { login, register, logout } = require('../authController');
const User = require('../../models/User');

jest.mock('../../models/User');
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}));
// Mock the CSRF helper so auth tests don't need JWT_SECRET set
jest.mock('../../middlewares/csrf', () => ({
  setCsrfCookie: jest.fn()
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
      cookie: mockCookie,
      clearCookie: jest.fn().mockReturnThis()
    };
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_EXPIRE = '30d';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── login ──────────────────────────────────────────────────────────────────
  describe('login', () => {
    it('should return 400 when email or password is missing', async () => {
      mockReq.body = { email: 'test@test.com' }; // no password

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false
      }));
    });

    it('should return 401 if user does not exist', async () => {
      mockReq.body = { email: 'test@test.com', password: 'password' };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await login(mockReq, mockRes);

      // Controller returns 401 for invalid credentials (user not found)
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Invalid credentials'
      }));
    });

    it('should return 401 if password does not match', async () => {
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

    it('should return 200 and set httpOnly token cookie on successful login', async () => {
      mockReq.body = { email: 'test@test.com', password: 'password' };
      const mockUser = {
        _id: '123',
        name: 'Test',
        email: 'test@test.com',
        role: 'user',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true)
      };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      // Auth cookie must be httpOnly
      expect(mockRes.cookie).toHaveBeenCalledWith('token', expect.any(String), expect.objectContaining({
        httpOnly: true
      }));
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        token: expect.any(String),
        user: expect.objectContaining({ email: 'test@test.com' })
      }));
    });
  });

  // ── logout ─────────────────────────────────────────────────────────────────
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

  // ── register ───────────────────────────────────────────────────────────────
  describe('register', () => {
    it('should return 400 if user already exists', async () => {
      mockReq.body = { name: 'Test', email: 'exists@test.com', password: 'pass', phone: '9999999999' };
      User.findOne.mockResolvedValue({ _id: 'existing' });

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'User already exists with this email'
      }));
    });

    it('should return 201 and set auth cookie on successful registration', async () => {
      mockReq.body = { name: 'New User', email: 'new@test.com', password: 'password', phone: '9999999999' };
      User.findOne.mockResolvedValue(null);
      const newUser = { _id: 'newid', name: 'New User', email: 'new@test.com', role: 'user' };
      User.create.mockResolvedValue(newUser);

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.cookie).toHaveBeenCalledWith('token', expect.any(String), expect.objectContaining({
        httpOnly: true
      }));
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        user: expect.objectContaining({ role: 'user' })
      }));
    });

    it('should never set user role from request body', async () => {
      // Even if attacker sends role: 'admin', the controller must ignore it
      mockReq.body = { name: 'Hacker', email: 'hacker@test.com', password: 'pass', phone: '9999999999', role: 'admin' };
      User.findOne.mockResolvedValue(null);
      const createdUser = { _id: 'hid', name: 'Hacker', email: 'hacker@test.com', role: 'user' };
      User.create.mockResolvedValue(createdUser);

      await register(mockReq, mockRes);

      // User.create must be called with role: 'user', not 'admin'
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ role: 'user' }));
      expect(User.create).not.toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }));
    });
  });
});
