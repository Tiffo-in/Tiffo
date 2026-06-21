const { login, register, logout, verifyEmail, resendVerification } = require('../authController');
const User = require('../../models/User');
const { sendVerificationEmail } = require('../../services/emailService');

jest.mock('../../models/User');
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));
// Mock the CSRF helper so auth tests don't need JWT_SECRET set
jest.mock('../../middlewares/csrf', () => ({
  setCsrfCookie: jest.fn(),
  getCookieDomain: jest.fn().mockReturnValue(undefined),
}));
// Mock the email service helper
jest.mock('../../services/emailService', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue({ success: true }),
}));

describe('Auth Controller', () => {
  let mockReq;
  let mockRes;
  let mockCookie;

  beforeEach(() => {
    mockCookie = jest.fn().mockReturnThis();
    mockReq = {
      body: {},
      query: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:5001'),
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: mockCookie,
      clearCookie: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
    };
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_EXPIRE = '30d';
    process.env.FRONTEND_URL = 'http://localhost:3000';
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
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        }),
      );
    });

    it('should return 401 if user does not exist', async () => {
      mockReq.body = { email: 'test@test.com', password: 'password' };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await login(mockReq, mockRes);

      // Controller returns 401 for invalid credentials (user not found)
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid credentials',
        }),
      );
    });

    it('should return 401 if password does not match', async () => {
      mockReq.body = { email: 'test@test.com', password: 'password' };
      const mockUser = {
        _id: '123',
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid credentials',
        }),
      );
    });

    it('should return 403 if email is not verified', async () => {
      mockReq.body = { email: 'test@test.com', password: 'password' };
      const mockUser = {
        _id: '123',
        name: 'Test',
        email: 'test@test.com',
        role: 'user',
        isActive: true,
        isEmailVerified: false,
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Please verify your email address before logging in.',
          isEmailVerified: false,
        }),
      );
    });

    it('should return 200 and set httpOnly token cookie on successful login', async () => {
      mockReq.body = { email: 'test@test.com', password: 'password' };
      const mockUser = {
        _id: '123',
        name: 'Test',
        email: 'test@test.com',
        role: 'user',
        isActive: true,
        isEmailVerified: true,
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      // Auth cookie must be httpOnly
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'token',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
        }),
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          token: expect.any(String),
          user: expect.objectContaining({ email: 'test@test.com' }),
        }),
      );
    });
  });

  // ── logout ─────────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('should return 200 and clear the token cookie', () => {
      logout(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'token',
        'none',
        expect.objectContaining({
          httpOnly: true,
        }),
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        }),
      );
    });
  });

  // ── register ───────────────────────────────────────────────────────────────
  describe('register', () => {
    it('should return 400 if user already exists', async () => {
      mockReq.body = {
        name: 'Test',
        email: 'exists@test.com',
        password: 'pass',
        phone: '9999999999',
      };
      User.findOne.mockResolvedValue({ _id: 'existing' });

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'User already exists with this email',
        }),
      );
    });

    it('should return 201 and send verification email on successful registration', async () => {
      mockReq.body = {
        name: 'New User',
        email: 'new@test.com',
        password: 'password',
        phone: '9999999999',
      };
      User.findOne.mockResolvedValue(null);
      const newUser = { _id: 'newid', name: 'New User', email: 'new@test.com', role: 'user' };
      User.create.mockResolvedValue(newUser);

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New User',
          email: 'new@test.com',
          role: 'user',
          isEmailVerified: false,
          emailVerificationToken: expect.any(String),
          emailVerificationExpires: expect.any(Number),
        }),
      );
      expect(sendVerificationEmail).toHaveBeenCalledWith(
        newUser,
        expect.stringContaining('/api/auth/verify-email?token='),
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message:
            'Registration successful! Please check your email to verify your account before logging in.',
        }),
      );
      expect(mockRes.cookie).not.toHaveBeenCalled();
    });

    it('should never set user role from request body', async () => {
      // Even if attacker sends role: 'admin', the controller must ignore it
      mockReq.body = {
        name: 'Hacker',
        email: 'hacker@test.com',
        password: 'pass',
        phone: '9999999999',
        role: 'admin',
      };
      User.findOne.mockResolvedValue(null);
      const createdUser = { _id: 'hid', name: 'Hacker', email: 'hacker@test.com', role: 'user' };
      User.create.mockResolvedValue(createdUser);

      await register(mockReq, mockRes);

      // User.create must be called with role: 'user', not 'admin'
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ role: 'user' }));
      expect(User.create).not.toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }));
    });
  });

  // ── verifyEmail ────────────────────────────────────────────────────────────
  describe('verifyEmail', () => {
    it('should redirect to login with missing_token if no token provided', async () => {
      mockReq.query = {};
      mockRes.redirect = jest.fn();

      await verifyEmail(mockReq, mockRes);

      expect(mockRes.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/login?verified=false&reason=missing_token',
      );
    });

    it('should redirect with invalid_or_expired_token if token is invalid or expired', async () => {
      mockReq.query = { token: 'invalid' };
      User.findOne.mockResolvedValue(null);
      mockRes.redirect = jest.fn();

      await verifyEmail(mockReq, mockRes);

      expect(mockRes.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/login?verified=false&reason=invalid_or_expired_token',
      );
    });

    it('should verify user and redirect with verified=true if token is valid', async () => {
      mockReq.query = { token: 'valid_token' };
      const mockUser = {
        email: 'user@test.com',
        isEmailVerified: false,
        save: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(mockUser);
      mockRes.redirect = jest.fn();

      await verifyEmail(mockReq, mockRes);

      expect(mockUser.isEmailVerified).toBe(true);
      expect(mockUser.emailVerificationToken).toBeNull();
      expect(mockUser.emailVerificationExpires).toBeNull();
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockRes.redirect).toHaveBeenCalledWith('http://localhost:3000/login?verified=true');
    });
  });

  // ── resendVerification ──────────────────────────────────────────────────────
  describe('resendVerification', () => {
    it('should return 400 if email is missing', async () => {
      mockReq.body = {};

      await resendVerification(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Please provide email' }),
      );
    });

    it('should return 404 if user not found', async () => {
      mockReq.body = { email: 'notfound@test.com' };
      User.findOne.mockResolvedValue(null);

      await resendVerification(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'User not found' }),
      );
    });

    it('should return 400 if user is already verified', async () => {
      mockReq.body = { email: 'verified@test.com' };
      const mockUser = { isEmailVerified: true };
      User.findOne.mockResolvedValue(mockUser);

      await resendVerification(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Email is already verified' }),
      );
    });

    it('should send new verification email and return success if user is unverified', async () => {
      mockReq.body = { email: 'unverified@test.com' };
      const mockUser = {
        email: 'unverified@test.com',
        isEmailVerified: false,
        save: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(mockUser);

      await resendVerification(mockReq, mockRes);

      expect(mockUser.emailVerificationToken).toEqual(expect.any(String));
      expect(mockUser.emailVerificationExpires).toBeGreaterThan(Date.now());
      expect(mockUser.save).toHaveBeenCalled();
      expect(sendVerificationEmail).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Verification email resent successfully! Please check your inbox.',
        }),
      );
    });
  });
});
