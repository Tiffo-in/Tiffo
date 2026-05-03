import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

const BankDetailsForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        pan: '',
        gst: '',
        businessName: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.accountNumber !== formData.confirmAccountNumber) {
            setError('Account numbers do not match');
            return;
        }

        if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
            setError('Invalid PAN format (e.g., AAAAA1234A)');
            return;
        }

        if (formData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
            setError('Invalid IFSC code format');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await api.post('/payments/setup-partner-account', {
                bankDetails: {
                    accountNumber: formData.accountNumber,
                    ifscCode: formData.ifscCode.toUpperCase(),
                    accountHolderName: formData.accountHolderName
                },
                taxDetails: {
                    pan: formData.pan.toUpperCase(),
                    gst: formData.gst.toUpperCase()
                },
                businessName: formData.businessName
            });

            if (response.data) {
                toast.success('Bank details saved! You can now receive payments.');
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save bank details');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
        >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-3xl mr-3">🏦</span>
                Bank Account Details
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                    <strong>Important:</strong> This information is required to receive payments from customers.
                    All data is encrypted and securely stored.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Business Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name *
                    </label>
                    <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="e.g., Delhi Home Kitchen"
                    />
                </div>

                {/* Account Holder Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Holder Name *
                    </label>
                    <input
                        type="text"
                        name="accountHolderName"
                        value={formData.accountHolderName}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="As per bank account"
                    />
                </div>

                {/* Account Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Number *
                        </label>
                        <input
                            type="text"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleChange}
                            required
                            className="input-field"
                            placeholder="Enter account number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Account Number *
                        </label>
                        <input
                            type="text"
                            name="confirmAccountNumber"
                            value={formData.confirmAccountNumber}
                            onChange={handleChange}
                            required
                            className="input-field"
                            placeholder="Re-enter account number"
                        />
                    </div>
                </div>

                {/* IFSC Code */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        IFSC Code *
                    </label>
                    <input
                        type="text"
                        name="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleChange}
                        required
                        maxLength={11}
                        className="input-field uppercase"
                        placeholder="e.g., HDFC0001234"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Find your IFSC code on your bank passbook or cheque
                    </p>
                </div>

                {/* PAN */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        PAN Number *
                    </label>
                    <input
                        type="text"
                        name="pan"
                        value={formData.pan}
                        onChange={handleChange}
                        required
                        maxLength={10}
                        className="input-field uppercase"
                        placeholder="e.g., AAAAA1234A"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Required for tax compliance and payment processing
                    </p>
                </div>

                {/* GST (Optional) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        GST Number (Optional)
                    </label>
                    <input
                        type="text"
                        name="gst"
                        value={formData.gst}
                        onChange={handleChange}
                        maxLength={15}
                        className="input-field uppercase"
                        placeholder="e.g., 22AAAAA0000A1Z5"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        If you have GST registration
                    </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5 mr-2 inline" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Saving...
                            </>
                        ) : (
                            'Save Bank Details'
                        )}
                    </button>
                </div>
            </form>

            {/* Security Note */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-600">
                    🔒 <strong>Security:</strong> Your bank details are encrypted and stored securely.
                    We never store your full account number in plain text.
                </p>
            </div>
        </motion.div>
    );
};

export default BankDetailsForm;
