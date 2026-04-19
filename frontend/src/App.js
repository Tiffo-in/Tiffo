import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store/store';
import SocketProvider from './contexts/SocketProvider';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import LoadingSpinner from './components/LoadingSpinner';

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
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-2">Something went wrong</h2>
            <p className="text-neutral-500 mb-6">An unexpected error occurred. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
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
    <ThemeProvider>
      <Provider store={store}>
        <SocketProvider>
          <Router>
      <ScrollToTop />
            <ErrorBoundary>
              <div className="App min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-300">
                <Navbar />
                <main>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/tiffins" element={<Tiffins />} />
                      <Route path="/tiffins/:id" element={<TiffinDetail />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/partner/dashboard" element={<PartnerDashboard />} />
                      <Route path="/partner/profile" element={<PartnerProfile />} />
                      <Route path="/partner/tiffins" element={<MyTiffins />} />
                      <Route path="/partner/ads" element={<PartnerAds />} />
                      <Route path="/partner/orders" element={<Orders />} />
                      <Route path="/partner/earnings" element={<Earnings />} />
                      <Route path="/partner/analytics" element={<Analytics />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/security" element={<Security />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/support" element={<Support />} />
                      <Route path="/report-fraud" element={<ReportFraud />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:slug" element={<BlogPost />} />
                      <Route path="/checkout/:subscriptionId" element={<Checkout />} />
                      <Route path="/payment/success" element={<PaymentSuccess />} />
                      <Route path="/payment/failed" element={<PaymentFailed />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      {/* Admin Routes */}
                      <Route path="/admin/dashboard" element={<AdminDashboard />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/admin/partners" element={<AdminPartners />} />
                      <Route path="/admin/analytics" element={<CustomerAnalytics />} />
                      <Route path="/admin/payments" element={<AdminPayments />} />
                      <Route path="/admin/alerts" element={<AdminAlerts />} />
                      <Route path="/admin/deliveries" element={<AdminDeliveries />} />
                      <Route path="/admin/blog" element={<AdminBlog />} />
                      <Route path="/admin/blog/new" element={<BlogEditor />} />
                      <Route path="/admin/blog/edit/:id" element={<BlogEditor />} />
                      <Route path="/admin/support" element={<AdminSupport />} />
                      <Route path="/admin/fraud" element={<AdminFraud />} />
                      {/* 404 fallback */}
                      <Route path="*" element={
                        <div className="min-h-screen flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-8xl mb-4">🍱</div>
                            <h2 className="text-3xl font-bold text-neutral-800 mb-2">Page Not Found</h2>
                            <p className="text-neutral-500 mb-6">The page you're looking for doesn't exist.</p>
                            <a href="/" className="btn-primary inline-block">Go Home</a>
                          </div>
                        </div>
                      } />
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
  );
}

export default App;