import React from 'react';
import { motion } from 'framer-motion';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
              <p className="text-gray-600">By using Tiffo services, you agree to these terms and conditions.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Service Description</h2>
              <p className="text-gray-600">Tiffo connects customers with local tiffin service providers for meal delivery subscriptions.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">User Responsibilities</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Provide accurate information during registration</li>
                <li>Maintain account security</li>
                <li>Pay for services as agreed</li>
                <li>Respect delivery personnel and partners</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Partner Responsibilities</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Maintain food safety and quality standards</li>
                <li>Deliver orders on time</li>
                <li>Provide accurate menu information</li>
                <li>Comply with local regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Cancellation Policy</h2>
              <p className="text-gray-600">Subscriptions can be cancelled with 24 hours notice. Refunds are processed according to our refund policy.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Contact</h2>
              <p className="text-gray-600">For questions about these terms, contact legal@tiffo.com</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;