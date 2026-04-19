import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const sections = [
  {
    title: 'Information We Collect',
    content: `We collect information you provide directly, such as when you create an account, place orders, manage a tiffin service, or contact us for support. This includes:
    
• **Account data:** Name, email address, phone number, profile photo.
• **Order data:** Delivery addresses, tiffin preferences, subscription plans, payment history.
• **Partner data:** Business name, bank account details (encrypted), FSSAI license, tax information.
• **Device & usage data:** IP address, browser type, pages visited, time spent (collected automatically via cookies and server logs).
• **Location data:** City-level location for tiffin matching (only with your permission).`
  },
  {
    title: 'How We Use Your Information',
    content: `We use your information solely to provide, improve, and secure the Tiffo platform:

• Process and deliver your tiffin subscriptions and one-time orders.
• Communicate order updates, delivery notifications, and support responses.
• Process payments securely through Razorpay (we never store raw card data).
• Match customers with tiffin providers based on location and preferences.
• Prevent fraud, abuse, and unauthorized access to accounts.
• Send promotional offers and newsletters (only with your explicit consent — you can opt out anytime).
• Improve platform performance using anonymized, aggregated analytics.`
  },
  {
    title: 'Data Sharing',
    content: `We do not sell your personal data to third parties. We share data only in limited, necessary situations:

• **Tiffin Partners:** We share your delivery address and contact number with the partner fulfilling your order. Partners are contractually bound by our data protection policy.
• **Payment Processors:** Razorpay processes payments under their own Privacy Policy and PCI-DSS compliance.
• **Service Providers:** We use cloud infrastructure (MongoDB Atlas, AWS), email delivery (Nodemailer/SendGrid), and analytics tools — all under strict data processing agreements.
• **Legal Requirements:** If required by law, court order, or to protect the rights and safety of our users.`
  },
  {
    title: 'Cookies & Tracking',
    content: `Tiffo uses cookies and similar technologies to:

• Keep you logged in across sessions (essential cookies — cannot be disabled).
• Remember your preferences (dark mode, location, filters).
• Analyze page performance and improve the user experience (analytics cookies — can be opted out).

You can manage cookies through your browser settings. Disabling essential cookies may affect platform functionality.`
  },
  {
    title: 'Data Retention',
    content: `We retain your data for as long as your account is active, plus:

• **Order data:** 3 years (for tax and compliance purposes).
• **Payment records:** 7 years (as required by Indian financial regulations).
• **Support tickets:** 1 year after resolution.
• **Deleted accounts:** Most data is permanently deleted within 30 days of account deletion, except data required by law.`
  },
  {
    title: 'Your Rights (DPDP Act 2023)',
    content: `Under the Digital Personal Data Protection Act, 2023 (India), you have the right to:

• **Access:** Request a copy of the personal data we hold about you.
• **Correction:** Ask us to correct inaccurate or incomplete data.
• **Erasure:** Request deletion of your personal data (subject to legal retention obligations).
• **Portability:** Export your data in a machine-readable format.
• **Withdraw Consent:** Opt out of non-essential data processing at any time.

To exercise these rights, email us at **privacy@tiffo.com** with the subject "Data Rights Request". We will respond within 30 days.`
  },
  {
    title: 'Data Security',
    content: `We implement industry-standard security measures to protect your data:

• **Encryption:** All data is encrypted in transit (TLS 1.3) and at rest (AES-256).
• **Authentication:** Secure JWT tokens with short expiry, bcrypt password hashing.
• **Infrastructure:** Hosted on hardened cloud infrastructure with restricted access controls.
• **Monitoring:** 24/7 security monitoring, intrusion detection, and automated threat response.

Despite best efforts, no system is 100% secure. Please report any suspected security vulnerabilities to **security@tiffo.com**.`
  },
  {
    title: 'Children\'s Privacy',
    content: `Tiffo is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from minors. If you believe we have inadvertently collected data from a minor, please contact us immediately at privacy@tiffo.com.`
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. When we make significant changes, we will notify you via email and in-app notification at least 7 days before the changes take effect. Your continued use of the platform after that date constitutes your acceptance of the updated policy.`
  },
  {
    title: 'Contact Us',
    content: `If you have questions, concerns, or requests regarding this Privacy Policy:

• **Email:** privacy@tiffo.com  
• **Postal Address:** Tiffo Technologies Pvt. Ltd., [Your Address], India  
• **Support:** https://tiffo.com/support  

We aim to respond to all privacy-related inquiries within 5 business days.`
  },
];

const Privacy = () => {
  const [openSection, setOpenSection] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-10 -right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <ShieldCheckIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">Privacy Policy</h1>
                <p className="text-white/70 text-sm mt-0.5">Last updated: April 2026</p>
              </div>
            </div>
            <p className="text-white/80 text-sm mt-4 max-w-2xl">
              Your privacy matters. This policy explains what data we collect, why we collect it, and how you can control it.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-100 dark:border-neutral-800 overflow-hidden"
        >
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {sections.map((section, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenSection(openSection === i ? null : i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-300 shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{section.title}</span>
                  </div>
                  <span className={`text-2xl text-primary-500 transition-transform duration-200 ${openSection === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openSection === i && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-6 pb-6 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line"
                  >
                    {section.content}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <p className="text-center text-xs text-neutral-400 mt-8">
          © {new Date().getFullYear()} Tiffo Technologies Pvt. Ltd. · <a href="/terms" className="hover:text-primary-500">Terms of Service</a> · <a href="/support" className="hover:text-primary-500">Contact Support</a>
        </p>
      </div>
    </div>
  );
};

export default Privacy;