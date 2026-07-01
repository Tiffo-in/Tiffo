const crypto = require('crypto');
const { csrfProtection, generateCsrfToken, setCsrfCookie } = require('../csrf');

describe('CSRF Middleware', () => {
  let mockReq;
  let mockRes;
  let next;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test_jwt_secret_value_123';
    process.env.NODE_ENV = 'development';

    next = jest.fn();
    mockReq = {
      method: 'POST',
      path: '/api/some-route',
      cookies: {},
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateCsrfToken', () => {
    it('should generate a token for a user ID', () => {
      const userId = 'user123';
      const token = generateCsrfToken(userId);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // SHA-256 hex is 64 characters
    });

    it('should throw an error if JWT_SECRET is not set', () => {
      delete process.env.JWT_SECRET;
      expect(() => generateCsrfToken('user123')).toThrow('JWT_SECRET env var is required for CSRF');
    });
  });

  describe('setCsrfCookie', () => {
    it('should set the csrf_token cookie and return the token', () => {
      const userId = 'user123';
      const token = setCsrfCookie(userId, mockRes);

      expect(token).toBeDefined();
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'csrf_token',
        token,
        expect.objectContaining({
          httpOnly: false,
          secure: false,
          sameSite: 'lax',
        }),
      );
    });

    it('should set secure and sameSite lax in production', () => {
      process.env.NODE_ENV = 'production';
      const userId = 'user123';
      setCsrfCookie(userId, mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'csrf_token',
        expect.any(String),
        expect.objectContaining({
          secure: true,
          sameSite: 'lax',
        }),
      );
    });
  });

  describe('csrfProtection middleware', () => {
    it('should bypass GET requests', () => {
      mockReq.method = 'GET';
      csrfProtection(mockReq, mockRes, next);
      expect(next).toHaveBeenCalled();
    });

    it('should bypass HEAD requests', () => {
      mockReq.method = 'HEAD';
      csrfProtection(mockReq, mockRes, next);
      expect(next).toHaveBeenCalled();
    });

    it('should bypass OPTIONS requests', () => {
      mockReq.method = 'OPTIONS';
      csrfProtection(mockReq, mockRes, next);
      expect(next).toHaveBeenCalled();
    });

    it('should bypass exempt routes', () => {
      mockReq.path = '/api/auth/login';
      csrfProtection(mockReq, mockRes, next);
      expect(next).toHaveBeenCalled();

      next.mockClear();
      mockReq.path = '/api/auth/register';
      csrfProtection(mockReq, mockRes, next);
      expect(next).toHaveBeenCalled();
    });

    it('should bypass requests with Bearer token authentication', () => {
      mockReq.headers.authorization = 'Bearer token123';
      csrfProtection(mockReq, mockRes, next);
      expect(next).toHaveBeenCalled();
    });

    it('should bypass CSRF if session cookie is missing', () => {
      mockReq.cookies = {}; // No token cookie
      csrfProtection(mockReq, mockRes, next);
      expect(next).toHaveBeenCalled();
    });

    it('should bypass CSRF if session cookie is none', () => {
      mockReq.cookies = { token: 'none' };
      csrfProtection(mockReq, mockRes, next);
      expect(next).toHaveBeenCalled();
    });

    describe('when session cookie is present', () => {
      beforeEach(() => {
        const jwt = require('jsonwebtoken');
        mockReq.cookies.token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET);
      });

      it('should return 403 if CSRF header is missing', () => {
        mockReq.cookies.csrf_token = 'some_csrf_token';
        csrfProtection(mockReq, mockRes, next);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'CSRF token missing',
          }),
        );
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 403 if CSRF cookie is missing', () => {
        mockReq.headers['x-csrf-token'] = 'some_csrf_token';
        csrfProtection(mockReq, mockRes, next);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'CSRF token missing',
          }),
        );
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 403 if CSRF header and cookie do not match', () => {
        mockReq.cookies.csrf_token = 'a1'.repeat(32); // Valid hex lengths
        mockReq.headers['x-csrf-token'] = 'b2'.repeat(32);

        csrfProtection(mockReq, mockRes, next);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'Invalid CSRF token',
          }),
        );
        expect(next).not.toHaveBeenCalled();
      });

      it('should proceed if CSRF header and cookie match', () => {
        const token = generateCsrfToken('user123');
        mockReq.cookies.csrf_token = token;
        mockReq.headers['x-csrf-token'] = token;

        csrfProtection(mockReq, mockRes, next);

        expect(next).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });
    });
  });
});
