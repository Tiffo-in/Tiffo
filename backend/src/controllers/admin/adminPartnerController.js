const User = require('../../models/User');
const Partner = require('../../models/Partner');
const logger = require('../../utils/logger');
const { emitNotification } = require('../../services/socketService');

/**
 * Get pending partner applications for review
 * GET /api/admin/partners/pending
 */
exports.getPendingPartners = async (req, res) => {
    try {
        const partners = await User.find({
            role: 'partner',
            isVerified: false
        })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: partners
        });
    } catch (error) {
        logger.error('getPendingPartners error:', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Approve or reject a partner application
 * PATCH /api/admin/partners/:id/status
 */
exports.updatePartnerStatus = async (req, res) => {
    try {
        const { status, reason } = req.body;

        const partner = await User.findOne({
            _id: req.params.id,
            role: 'partner'
        });

        if (!partner) {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }

        const partnerProfile = await Partner.findOne({ user: partner._id });

        if (status === 'approved') {
            partner.isVerified = true;
            if (partnerProfile) {
                partnerProfile.verified = true;
                partnerProfile.verifiedAt = new Date();
                partnerProfile.payoutEnabled = true;
                await partnerProfile.save();
            }
        } else if (status === 'rejected') {
            partner.isVerified = false;
            if (partnerProfile) {
                partnerProfile.verified = false;
                partnerProfile.rejectionReason = reason;
                partnerProfile.rejectedAt = new Date();
                await partnerProfile.save();
            }
        }

        await partner.save();

        emitNotification(partner._id, {
            title: status === 'approved' ? 'Application Approved! 🎉' : 'Application Update',
            message: status === 'approved'
                ? 'Congratulations! Your partner application has been approved. You can now start listing your tiffins.'
                : `Your application was not approved. Reason: ${reason}`,
            type: status === 'approved' ? 'success' : 'warning'
        });

        res.json({
            success: true,
            message: `Partner ${status} successfully`
        });
    } catch (error) {
        logger.error('updatePartnerStatus error:', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
