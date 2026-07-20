const Razorpay = require('razorpay');
const crypto = require('crypto');
const AdCampaign = require('../models/AdCampaign');
const AdImpression = require('../models/AdImpression');
const AdClick = require('../models/AdClick');
const Partner = require('../models/Partner');
const mongoose = require('mongoose');

// A viewer is billed at most once per campaign inside this window; further
// clicks are acknowledged but free. Blunts scripted budget-drain attacks.
const CLICK_BILLING_COOLDOWN_MS = 10 * 60 * 1000;
// Hard daily ceiling of billed clicks per viewer per campaign.
const MAX_BILLED_CLICKS_PER_VIEWER_PER_DAY = 3;

// Init Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper to determine active slot based on current time
const getCurrentSlot = () => {
  const currentHour = new Date().getHours();
  return currentHour < 15 ? 'Lunch' : 'Dinner';
};

// Fields a partner may set on their own campaign. Money and counter fields
// (walletBalance, spentToday, totalSpent, freeImpressions, impressionsCount,
// clicksCount) are server-managed only — wallet balance changes exclusively
// through verified Razorpay top-ups and click billing.
const CAMPAIGN_WRITABLE_FIELDS = [
  'tiffin',
  'slot',
  'maxBidPerClick',
  'dailyBudget',
  'hasTrialMealBoost',
  'trialMealPrice',
  'menuOfTheDay',
  'isActive',
];

const pickCampaignFields = (body) =>
  Object.fromEntries(
    CAMPAIGN_WRITABLE_FIELDS.filter((field) => body[field] !== undefined).map((field) => [
      field,
      body[field],
    ]),
  );

/**
 * Lazy daily reset: reset spentToday on any campaign whose lastSpentDate
 * is before the start of today. This avoids a cron job.
 */
const resetDailyBudgetsIfNeeded = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  await AdCampaign.updateMany(
    {
      $or: [{ lastSpentDate: { $lt: startOfToday } }, { lastSpentDate: null }],
    },
    { $set: { spentToday: 0, lastSpentDate: new Date() } },
  );
};

// ==============================
// PUBLIC ENDPOINTS
// ==============================

// GET /api/ads/listings
// Description: Get nearby ads mixed with organic results (or just ads for a specific feed)
exports.getAdListings = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ success: false, message: 'Latitude and longitude are required' });
    }

    // Bug 10 fix: lazy-reset daily budgets before querying active campaigns
    await resetDailyBudgetsIfNeeded();

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    // Hardcoded user ID or IP for frequency capping
    // In actual app, use req.user?.id or extract IP
    const trackingUserId = req.user ? req.user.id : req.ip;

    // 1. Find nearby partners
    const nearbyPartners = await Partner.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [userLng, userLat] },
          distanceField: 'distance',
          maxDistance: searchRadius * 1000,
          distanceMultiplier: 1 / 1000,
          spherical: true,
          query: { isActive: true },
        },
      },
    ]);

    const partnerIds = nearbyPartners.map((p) => p._id);
    const distanceMap = {};
    nearbyPartners.forEach((p) => {
      distanceMap[p._id.toString()] = p.distance;
    });

    const activeSlot = getCurrentSlot();

    // 2. Find Active Ad Campaigns for these partners
    const activeCampaigns = await AdCampaign.find({
      partner: { $in: partnerIds },
      isActive: true,
      $or: [{ slot: activeSlot }, { slot: 'AllDay' }],
      $expr: {
        $lt: ['$spentToday', '$dailyBudget'],
      },
    }).populate('partner', 'businessName rating address logo hasActiveSubscriptionBadge');

    // 3. Prevent Ad Fatigue (Frequency Capping)
    const campaignIds = activeCampaigns.map((c) => c._id);

    // Find how many times this user saw each active campaign TODAY
    const impressionsToday = await AdImpression.aggregate([
      {
        $match: {
          userId: trackingUserId,
          campaignId: { $in: campaignIds },
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      },
      {
        $group: {
          _id: '$campaignId',
          count: { $sum: 1 },
        },
      },
    ]);

    const impressionCounts = {};
    impressionsToday.forEach((imp) => {
      impressionCounts[imp._id.toString()] = imp.count;
    });

    // 4. Filter out campaigns with >= 3 impressions today for this user
    let candidates = activeCampaigns.filter((c) => {
      const shownCount = impressionCounts[c._id.toString()] || 0;
      return shownCount < 3; // MAX 3 IMPRESSIONS
    });

    // 5. Rank remaining campaigns by Ad Rank (Bid * Rating)
    candidates = candidates.map((c) => {
      const p = c.partner;
      const rank = c.maxBidPerClick * (p.rating && p.rating.average ? p.rating.average : 3);

      const campaignObj = c.toObject();
      campaignObj.distance = distanceMap[p._id.toString()];
      campaignObj.rankScore = rank;
      return campaignObj;
    });

    candidates.sort((a, b) => b.rankScore - a.rankScore);

    res.json({
      success: true,
      data: {
        sponsored: candidates.slice(0, 3), // Return top 3 ads
        // Could also fetch organic here if needed, but for now we separate concerns
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/ads/impressions
// Called asynchronously by frontend when ad scrolls into view (IntersectionObserver)
exports.logImpressions = async (req, res, next) => {
  try {
    const { campaignIds } = req.body;
    if (!campaignIds || !Array.isArray(campaignIds)) {
      return res.status(400).json({ success: false, message: 'campaignIds array is required' });
    }

    // Validate all campaignIds are valid ObjectIds
    const validIds = campaignIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid campaign IDs provided' });
    }

    const trackingUserId = req.user ? req.user.id : req.ip;

    const impressionDocs = validIds.map((id) => ({
      userId: trackingUserId,
      campaignId: new mongoose.Types.ObjectId(id),
    }));

    await AdImpression.insertMany(impressionDocs);

    // Update the aggregate count on the campaigns
    await AdCampaign.updateMany(
      { _id: { $in: validIds.map((id) => new mongoose.Types.ObjectId(id)) } },
      { $inc: { impressionsCount: 1 } },
    );

    res.json({ success: true, message: 'Impressions logged' });
  } catch (error) {
    next(error);
  }
};

// POST /api/ads/click/:id
exports.logClick = async (req, res, next) => {
  try {
    const campaignId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ success: false, message: 'Invalid campaign ID' });
    }

    const campaign = await AdCampaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }

    // Click-fraud guard: bill a viewer at most once per cooldown window and
    // at most MAX_BILLED_CLICKS_PER_VIEWER_PER_DAY times per day. Repeat
    // clicks are acknowledged (so the frontend never errors) but not billed
    // or counted, keeping CTR and spend honest.
    const viewerId = req.user ? req.user.id : req.ip;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [recentClick, billedToday] = await Promise.all([
      AdClick.findOne({
        userId: viewerId,
        campaignId: campaign._id,
        createdAt: { $gte: new Date(Date.now() - CLICK_BILLING_COOLDOWN_MS) },
      }).lean(),
      AdClick.countDocuments({
        userId: viewerId,
        campaignId: campaign._id,
        billed: true,
        createdAt: { $gte: startOfToday },
      }),
    ]);

    if (recentClick || billedToday >= MAX_BILLED_CLICKS_PER_VIEWER_PER_DAY) {
      return res.json({ success: true, message: 'Click logged', partnerId: campaign.partner });
    }

    campaign.clicksCount += 1;

    // Handle free impressions/clicks vs paid budget
    if (campaign.freeImpressions > 0) {
      campaign.freeImpressions -= 1;
    } else {
      // Deduct bid from budget and track date for daily reset
      campaign.spentToday += campaign.maxBidPerClick;
      campaign.walletBalance -= campaign.maxBidPerClick;
      campaign.lastSpentDate = new Date();
    }

    await Promise.all([
      campaign.save(),
      AdClick.create({ userId: viewerId, campaignId: campaign._id, billed: true }),
    ]);

    res.json({ success: true, message: 'Click logged', partnerId: campaign.partner });
  } catch (error) {
    next(error);
  }
};

// ==============================
// PARTNER ENDPOINTS (Protected by auth)
// ==============================

// POST /api/ads
exports.createCampaign = async (req, res, next) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner)
      return res.status(404).json({ success: false, message: 'Partner profile required' });

    const campaign = await AdCampaign.create({
      ...pickCampaignFields(req.body),
      partner: partner._id,
      freeImpressions: 500, // give 500 free impressions on creation
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
};

// GET /api/ads/mine
exports.getMyCampaigns = async (req, res, next) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner)
      return res.status(404).json({ success: false, message: 'Partner profile required' });

    const campaigns = await AdCampaign.find({ partner: partner._id }).populate('tiffin');
    res.json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
};

// PUT /api/ads/:id
exports.updateCampaign = async (req, res, next) => {
  try {
    // Validate campaign ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid campaign ID' });
    }

    const partner = await Partner.findOne({ user: req.user.id });
    const campaign = await AdCampaign.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(req.params.id), partner: partner._id },
      pickCampaignFields(req.body),
      { new: true, runValidators: true },
    );

    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    res.json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
};

// ==============================
// RAZORPAY WALLET ENDPOINTS
// ==============================

// POST /api/ads/wallet/create-order
exports.createWalletOrder = async (req, res, next) => {
  try {
    const { amount } = req.body; // Amount in INR
    if (!amount || amount < 100)
      return res.status(400).json({ success: false, message: 'Minimum wallet top-up is ₹100' });

    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner)
      return res
        .status(403)
        .json({ success: false, message: 'Only partners can add to Ad Wallet' });

    const options = {
      amount: amount * 100, // Razorpay takes amount in paise
      currency: 'INR',
      receipt: `wallet_rcpt_${Date.now()}_${partner._id}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// POST /api/ads/wallet/verify
exports.verifyWalletPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amountAdded } = req.body;

    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found' });

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Payment is successful, add amount to active AdCampaign or a general partner wallet.
    // Assuming the partner has at least one AdCampaign to top up, we find the first or the specified one.
    // For simplicity, top-up the most recently created active campaign.
    const campaign = await AdCampaign.findOne({ partner: partner._id, isActive: true }).sort({
      createdAt: -1,
    });

    if (campaign) {
      campaign.walletBalance += amountAdded; // amountAdded is in INR
      await campaign.save();
    } else {
      return res.status(400).json({
        success: false,
        message: 'No active AdCampaign found to credit balance to. Please create an ad first.',
      });
    }

    res.json({
      success: true,
      message: 'Wallet topped up successfully',
      walletBalance: campaign.walletBalance,
    });
  } catch (error) {
    next(error);
  }
};
