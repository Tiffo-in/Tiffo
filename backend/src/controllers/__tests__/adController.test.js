// Mock process.env before requiring the controller
process.env.RAZORPAY_KEY_ID = 'test_key_id';
process.env.RAZORPAY_KEY_SECRET = 'test_key_secret';

const { getAdListings } = require('../adController');
const AdCampaign = require('../../models/AdCampaign');
const AdImpression = require('../../models/AdImpression');
const Partner = require('../../models/Partner');

// Mock dependencies
jest.mock('../../models/AdCampaign');
jest.mock('../../models/AdImpression');
jest.mock('../../models/Partner');

describe('Ad Controller - getAdListings', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      query: { lat: '12.9716', lng: '77.5946' }, // default valid coords
      user: { id: 'user123' },
      ip: '127.0.0.1',
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Default mocks for Mongoose models
    AdCampaign.updateMany.mockResolvedValue({});
    Partner.aggregate.mockResolvedValue([]);
    AdCampaign.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([]),
    });
    AdImpression.aggregate.mockResolvedValue([]);
  });

  it('should return 400 if lat or lng are missing', async () => {
    req.query = { lat: '12.9716' }; // missing lng
    await getAdListings(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Latitude and longitude are required',
    });
  });

  it('should return empty sponsored array when no nearby partners are found', async () => {
    // Edge case test requested: empty results
    Partner.aggregate.mockResolvedValue([]); // No nearby partners

    await getAdListings(req, res);

    expect(Partner.aggregate).toHaveBeenCalled();
    // Since no partners are found, AdCampaign.find will be called with empty array, but the final candidates should be empty.
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        sponsored: [],
      },
    });
  });

  it('should return empty sponsored array when no active campaigns match nearby partners', async () => {
    // Edge case test: nearby partners found, but no active campaigns
    Partner.aggregate.mockResolvedValue([{ _id: 'partner1', distance: 2.5 }]);

    AdCampaign.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([]), // No campaigns found
    });

    await getAdListings(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        sponsored: [],
      },
    });
  });

  it('should return ranked active campaigns correctly', async () => {
    const mockPartner = { _id: 'partner1', distance: 2.5, rating: { average: 4.5 } };
    Partner.aggregate.mockResolvedValue([mockPartner]);

    const mockCampaign = {
      _id: 'campaign1',
      partner: mockPartner,
      maxBidPerClick: 10,
      toObject: function () {
        return { ...this };
      }, // mock toObject
    };

    AdCampaign.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([mockCampaign]),
    });

    // Assume 0 impressions today for this user
    AdImpression.aggregate.mockResolvedValue([]);

    await getAdListings(req, res);

    expect(res.json).toHaveBeenCalled();
    const jsonCall = res.json.mock.calls[0][0];

    expect(jsonCall.success).toBe(true);
    expect(jsonCall.data.sponsored).toHaveLength(1);

    const sponsored = jsonCall.data.sponsored[0];
    expect(sponsored._id).toBe('campaign1');
    expect(sponsored.distance).toBe(2.5);
    // Rank score = maxBidPerClick (10) * rating (4.5) = 45
    expect(sponsored.rankScore).toBe(45);
  });

  it('should filter out campaigns that reached the impression cap for the user', async () => {
    const mockPartner = { _id: 'partner1', distance: 2.5, rating: { average: 4.5 } };
    Partner.aggregate.mockResolvedValue([mockPartner]);

    const mockCampaign = {
      _id: 'campaign1',
      partner: mockPartner,
      maxBidPerClick: 10,
      toObject: function () {
        return { ...this };
      },
    };

    AdCampaign.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([mockCampaign]),
    });

    // Impression cap reached (>= 3 impressions today)
    AdImpression.aggregate.mockResolvedValue([{ _id: 'campaign1', count: 3 }]);

    await getAdListings(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        sponsored: [], // Should be empty because it was filtered out
      },
    });
  });

  it('should handle errors gracefully and return 500', async () => {
    Partner.aggregate.mockRejectedValue(new Error('Database error'));

    await getAdListings(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Database error',
    });
  });
});
