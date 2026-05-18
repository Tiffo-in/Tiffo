import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store/store';
import SocketProvider from './contexts/SocketProvider';
import { ThemeProvider } from './contexts/ThemeContext';
import { HelmetProvider } from 'react-helmet-async';
import * as Sentry from '@sentry/react';

// Components
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import LoadingSpinner from './components/LoadingSpinner';
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import api from './services/api';
import { loginAction } from './store/slices/authSlice';

// ── Session Hydrator — restores auth state from httpOnly cookie on page refresh
const SessionHydrator = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => {
        if (res.data?.success && res.data?.user) {
          dispatch(loginAction({ user: res.data.user }));
        }
      })
      .catch(() => {
        // No valid cookie — user is logged out, do nothing
      });
  }, [dispatch]);
  return null;
};

const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Tiffins = React.lazy(() => import('./pages/Tiffins'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const PartnerDashboard = React.lazy(() => import('./pages/PartnerDashboard'));
const PartnerProfile = React.lazy(() => import('./pages/PartnerProfile'));
const MyTiffins = React.lazy(() => import('./pages/MyTiffins'));
const PartnerAds = React.lazy(() => import('./pages/PartnerAds'));
const Orders = React.lazy(() => import('./pages/Orders'));
const Earnings = React.lazy(() => import('./pages/Earnings'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Security = React.lazy(() => import('./pages/Security'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Support = React.lazy(() => import('./pages/Support'));
const ReportFraud = React.lazy(() => import('./pages/ReportFraud'));
const Blog = React.lazy(() => import('./pages/Blog'));
const BlogPost = React.lazy(() => import('./pages/BlogPost'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const TiffinDetail = React.lazy(() => import('./pages/TiffinDetail'));
const PaymentSuccess = React.lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailed = React.lazy(() => import('./pages/PaymentFailed'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));

const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = React.lazy(() => import('./pages/AdminUsers'));
const AdminPartners = React.lazy(() => import('./pages/AdminPartners'));
const CustomerAnalytics = React.lazy(() => import('./pages/CustomerAnalytics'));
const AdminPayments = React.lazy(() => import('./pages/AdminPayments'));
const AdminAlerts = React.lazy(() => import('./pages/AdminAlerts'));
const AdminDeliveries = React.lazy(() => import('./pages/AdminDeliveries'));
const AdminBlog = React.lazy(() => import('./pages/AdminBlog'));
const BlogEditor = React.lazy(() => import('./components/BlogEditor'));
const AdminSupport = React.lazy(() => import('./pages/AdminSupport'));
const AdminFraud = React.lazy(() => import('./pages/AdminFraud'));

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    // Forward to Sentry in production
    if (process.env.REACT_APP_SENTRY_DSN) {
      Sentry.captureException(error, { extra: info });
    }
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center p-8">
            <div className="text-6xl mb-4" aria-hidden="true">
              ⚠️
            </div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-2">Something went wrong</h2>
            <p className="text-neutral-500 mb-6">
              An unexpected error occurred. Please refresh the page.
            </p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Provider store={store}>
          <SocketProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />

              {/* ── Skip Navigation — keyboard accessibility ─────────────────── */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:font-semibold"
              >
                Skip to main content
              </a>

              <ErrorBoundary>
                <div className="App min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-300">
                  <SessionHydrator />
                  <Navbar />
                  <main id="main-content">
                    <Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                        {/* ── Public Routes ── */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/tiffins" element={<Tiffins />} />
                        <Route path="/tiffins/:id" element={<TiffinDetail />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/security" element={<Security />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/report-fraud" element={<ReportFraud />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:slug" element={<BlogPost />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/payment/success" element={<PaymentSuccess />} />
                        <Route path="/payment/failed" element={<PaymentFailed />} />

                        {/* ── Authenticated User Routes ── */}
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <Dashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <ProfilePage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/checkout/:subscriptionId"
                          element={
                            <ProtectedRoute>
                              <Checkout />
                            </ProtectedRoute>
                          }
                        />

                        {/* ── Partner Routes ── */}
                        <Route
                          path="/partner/dashboard"
                          element={
                            <RoleRoute role="partner">
                              <PartnerDashboard />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/partner/profile"
                          element={
                            <RoleRoute role="partner">
                              <PartnerProfile />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/partner/tiffins"
                          element={
                            <RoleRoute role="partner">
                              <MyTiffins />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/partner/ads"
                          element={
                            <RoleRoute role="partner">
                              <PartnerAds />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/partner/orders"
                          element={
                            <RoleRoute role="partner">
                              <Orders />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/partner/earnings"
                          element={
                            <RoleRoute role="partner">
                              <Earnings />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/partner/analytics"
                          element={
                            <RoleRoute role="partner">
                              <Analytics />
                            </RoleRoute>
                          }
                        />

                        {/* ── Admin Routes ── */}
                        <Route
                          path="/admin/dashboard"
                          element={
                            <RoleRoute role="admin">
                              <AdminDashboard />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/admin/users"
                          element={
                            <RoleRoute role="admin">
                              <AdminUsers />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/admin/partners"
                          element={
                            <RoleRoute role="admin">
                              <AdminPartners />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/admin/analytics"
                          element={
                            <RoleRoute role="admin">
                              <CustomerAnalytics />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/admin/payments"
                          element={
                            <RoleRoute role="admin">
                              <AdminPayments />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/admin/alerts"
                          element={
                            <RoleRoute role="admin">
                              <AdminAlerts />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/admin/deliveries"
                          element={
                            <RoleRoute role="admin">
                              <AdminDeliveries />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/admin/blog"
                          element={
                            <RoleRoute role="admin">
                              <AdminBlog />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/admin/blog/new"
                          element={
                            <RoleRoute role="admin">
                              <BlogEditor />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/admin/blog/edit/:id"
                          element={
                            <RoleRoute role="admin">
                              <BlogEditor />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/admin/support"
                          element={
                            <RoleRoute role="admin">
                              <AdminSupport />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/admin/fraud"
                          element={
                            <RoleRoute role="admin">
                              <AdminFraud />
                            </RoleRoute>
                          }
                        />

                        {/* 404 fallback — uses React Router Link (no full reload) */}
                        <Route
                          path="*"
                          element={
                            <div className="min-h-screen flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-8xl mb-4" aria-hidden="true">
                                  🍱
                                </div>
                                <h2 className="text-3xl font-bold text-neutral-800 mb-2">
                                  Page Not Found
                                </h2>
                                <p className="text-neutral-500 mb-6">
                                  The page you're looking for doesn't exist.
                                </p>
                                <Link to="/" className="btn-primary inline-block">
                                  Go Home
                                </Link>
                              </div>
                            </div>
                          }
                        />
                      </Routes>
                    </Suspense>
                  </main>
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: { background: '#363636', color: '#fff' },
                    }}
                  />
                </div>
              </ErrorBoundary>
            </Router>
          </SocketProvider>
        </Provider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
