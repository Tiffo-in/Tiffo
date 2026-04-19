import React from 'react';
import { motion } from 'framer-motion';

const Security = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Security</h1>
          
          <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">🔒 Data Protection</h2>
              <p className="text-gray-600">All sensitive data is encrypted using industry-standard SSL/TLS protocols. Your payment information is processed through secure payment gateways.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">🛡️ Account Security</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Use strong, unique passwords</li>
                <li>Enable two-factor authentication when available</li>
                <li>Log out from shared devices</li>
                <li>Report suspicious activity immediately</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">💳 Payment Security</h2>
              <p className="text-gray-600">We use PCI DSS compliant payment processors. Your card details are never stored on our servers and are processed through encrypted channels.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">📱 Mobile App Security</h2>
              <p className="text-gray-600">Our mobile applications use secure authentication and encrypted data transmission to protect your information.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">🚨 Report Security Issues</h2>
              <p className="text-gray-600">If you discover a security vulnerability, please report it to security@tiffo.com</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Security;