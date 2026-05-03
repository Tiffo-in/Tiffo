import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Section = ({ icon, title, children }) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
      <span>{icon}</span> {title}
    </h2>
    <div className="text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-2">
      {children}
    </div>
  </section>
);

const Security = () => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-10">
            <span className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Security
            </span>
            <h1 className="text-4xl font-black text-neutral-900 dark:text-neutral-100 mb-3">
              How We Keep You Safe
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">
              Your security is our top priority. Here's how Tiffo protects your data and your transactions.
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 p-8 space-y-2">

            <Section icon="🔒" title="Data Encryption">
              <p>All data in transit is protected with TLS 1.3 (HTTPS). Sensitive data at rest is encrypted using AES-256.</p>
              <p>Your payment details are never stored on our servers — they are handled exclusively by Razorpay, a PCI DSS Level 1 certified payment processor.</p>
            </Section>

            <Section icon="🛡️" title="Account Security">
              <ul className="list-disc list-inside space-y-1">
                <li>Passwords are hashed with bcrypt (cost factor 12) and never stored in plain text</li>
                <li>Authentication uses secure <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">httpOnly</code> cookies — not localStorage — to prevent XSS token theft</li>
                <li>CSRF protection via the double-submit cookie pattern on all mutating requests</li>
                <li>Rate limiting on login and registration endpoints (10 requests / 15 minutes per IP)</li>
                <li>NoSQL injection prevention via input sanitization on all API endpoints</li>
                <li>XSS protection via server-side HTML sanitization on all user-supplied strings</li>
              </ul>
            </Section>

            <Section icon="💳" title="Payment Security">
              <p>All payments are processed through <strong>Razorpay</strong>, India's leading PCI DSS compliant payment gateway.</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Card numbers are never transmitted to or stored on Tiffo servers</li>
                <li>Payment webhook signatures are cryptographically verified (HMAC-SHA256)</li>
                <li>All refunds are processed through the same secure channel</li>
              </ul>
            </Section>

            <Section icon="📱" title="API Security">
              <ul className="list-disc list-inside space-y-1">
                <li>All API endpoints require authentication via verified JWT tokens</li>
                <li>Role-based access control: customers, partners, and admins have separate permission scopes</li>
                <li>Helmet.js sets secure HTTP headers on every response</li>
                <li>MongoDB sanitization prevents operator injection attacks</li>
              </ul>
            </Section>

            <Section icon="🌐" title="Infrastructure">
              <ul className="list-disc list-inside space-y-1">
                <li>Application runs behind HTTPS-only endpoints</li>
                <li>CORS policy allows only whitelisted frontend origins</li>
                <li>Distributed rate limiting via Upstash Redis in production</li>
                <li>Structured server-side logging for audit trails</li>
              </ul>
            </Section>

            <Section icon="🚨" title="Responsible Disclosure">
              <p>
                If you discover a security vulnerability in Tiffo, please report it responsibly to{' '}
                <a href="mailto:security@tiffo.in" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                  security@tiffo.in
                </a>
                . We take all reports seriously and will respond within 48 hours.
              </p>
              <p className="mt-2">Please do not publicly disclose a vulnerability until we have had a chance to address it.</p>
            </Section>

            <Section icon="📆" title="Last Updated">
              <p>This Security page was last updated on <strong>April 2026</strong>.</p>
            </Section>
          </div>

          <p className="text-center text-sm text-neutral-400 dark:text-neutral-600 mt-8">
            Questions? Visit our{' '}
            <Link to="/support" className="text-primary-600 dark:text-primary-400 hover:underline">Help & Support</Link>{' '}
            page or email{' '}
            <a href="mailto:help@tiffo.in" className="text-primary-600 dark:text-primary-400 hover:underline">help@tiffo.in</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Security;