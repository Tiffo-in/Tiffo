import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Reads the csrf_token from the browser's cookies.
 * The csrf_token is a non-httpOnly cookie set by the server on login/register.
 * We echo it back as an X-CSRF-Token header on every mutating request so the
 * server can verify it against the cookie value (double-submit cookie pattern).
 */
const getCsrfToken = () => {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrf_token='));
  return match ? match.split('=')[1] : null;
};

// ── Request interceptor ─────────────────────────────────────────────────────
// Attaches X-CSRF-Token header on every state-mutating request.
// Safe methods (GET, HEAD, OPTIONS) are exempt per RFC 7231.
api.interceptors.request.use(
  (config) => {
    const safeMethods = ['get', 'head', 'options'];
    if (!safeMethods.includes(config.method?.toLowerCase())) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ────────────────────────────────────────────────────
// Redirects to /login on 401; preserves error for callers on everything else.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user'); // only clear user UX state — cookies cleared by backend
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;