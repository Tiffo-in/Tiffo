import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">{title}</h2>
    <div className="text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-2">
      {children}
    </div>
  </section>
);

const Terms = () => {
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
              Legal
            </span>
            <h1 className="text-4xl font-black text-neutral-900 dark:text-neutral-100 mb-3">
              Terms of Service
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Effective date: <strong>April 1, 2026</strong> · Last updated: <strong>April 2026</strong>
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 p-8">

            <Section title="1. Acceptance of Terms">
              <p>
                By accessing or using the Tiffo platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service. We reserve the right to update these Terms at any time; continued use after notification of changes constitutes acceptance.
              </p>
            </Section>

            <Section title="2. Description of Service">
              <p>
                Tiffo is an online marketplace that connects customers ("Customers") with individual or small-business tiffin service providers ("Partners"). Tiffo facilitates discovery, subscription management, and payment processing but is not itself a food provider.
              </p>
            </Section>

            <Section title="3. User Accounts">
              <ul className="list-disc list-inside space-y-1">
                <li>You must be at least 18 years old to create an account</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>You must provide accurate, current, and complete registration information</li>
                <li>One person or legal entity may not maintain more than one account</li>
                <li>You must notify us immediately at <a href="mailto:help@tiffo.in" className="text-primary-600 dark:text-primary-400 hover:underline">help@tiffo.in</a> of any unauthorized use of your account</li>
              </ul>
            </Section>

            <Section title="4. Customer Responsibilities">
              <ul className="list-disc list-inside space-y-1">
                <li>Pay for all subscriptions as agreed at the time of purchase</li>
                <li>Provide accurate delivery address and contact information</li>
                <li>Respect delivery personnel, partner staff, and other platform users</li>
                <li>Not misuse the fraud reporting or support systems</li>
                <li>Ensure someone is available to receive deliveries at the specified time</li>
              </ul>
            </Section>

            <Section title="5. Partner Responsibilities">
              <ul className="list-disc list-inside space-y-1">
                <li>Maintain food safety, hygiene, and quality standards as per FSSAI regulations</li>
                <li>Deliver orders on time as committed during subscription creation</li>
                <li>Provide accurate and up-to-date menu information including allergens</li>
                <li>Comply with all applicable local laws and regulations</li>
                <li>Not engage in fraudulent activity including misrepresentation of products</li>
              </ul>
            </Section>

            <Section title="6. Subscriptions and Payments">
              <p>All prices are listed in Indian Rupees (₹) and include applicable GST (5%). Subscriptions are billed upfront for the chosen plan duration (daily, weekly, or monthly).</p>
              <p className="mt-2">Payments are processed securely by Razorpay. By purchasing a subscription, you authorize Tiffo to charge your selected payment method for the full subscription amount.</p>
            </Section>

            <Section title="7. Cancellation and Refund Policy">
              <ul className="list-disc list-inside space-y-1">
                <li>Subscriptions may be cancelled at any time from your dashboard</li>
                <li>Cancellations made before the subscription start date are eligible for a full refund</li>
                <li>Cancellations after the start date are subject to a pro-rated refund based on unused days</li>
                <li>Refunds are processed within 5–7 business days to the original payment method</li>
                <li>No refunds are issued for missed deliveries caused by incorrect address information provided by the Customer</li>
              </ul>
            </Section>

            <Section title="8. Intellectual Property">
              <p>All content on the Tiffo platform — including the brand name, logo, design, and software — is the property of Tiffo Technologies Pvt. Ltd. and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without prior written permission.</p>
            </Section>

            <Section title="9. Limitation of Liability">
              <p>
                To the maximum extent permitted by law, Tiffo shall not be liable for (a) any indirect, incidental, or consequential damages arising from use of the Service; (b) food quality or safety issues caused by Partner negligence; or (c) service interruptions beyond our reasonable control. Our maximum liability in any circumstance is limited to the amount you paid for the relevant subscription.
              </p>
            </Section>

            <Section title="10. Governing Law">
              <p>These Terms are governed by the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.</p>
            </Section>

            <Section title="11. Contact">
              <p>
                For questions about these Terms, contact us at{' '}
                <a href="mailto:legal@tiffo.in" className="text-primary-600 dark:text-primary-400 hover:underline">legal@tiffo.in</a>
                {' '}or visit our{' '}
                <Link to="/support" className="text-primary-600 dark:text-primary-400 hover:underline">Help & Support</Link>{' '}
                page.
              </p>
            </Section>
          </div>

          <p className="text-center text-sm text-neutral-400 dark:text-neutral-600 mt-8">
            Also see our{' '}
            <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link>
            {' '}and{' '}
            <Link to="/security" className="text-primary-600 dark:text-primary-400 hover:underline">Security Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;