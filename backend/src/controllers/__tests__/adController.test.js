process.env.RAZORPAY_KEY_ID = 'test_key_id';
process.env.RAZORPAY_KEY_SECRET = 'test_key_secret';

const { getAdListings } = require('../adController');
const AdCampaign = require('../../models/AdCampaign');
const AdImpression = require('../../models/AdImpression');
const Partner = require('../../models/Partner');

jest.mock('../../models/AdCampaign');
jest.mock('../../models/AdImpression');
jest.mock('../../models/Partner');
jest.mock('razorpay');

describe('adController - getAdListings', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      query: {},
      user: { id: 'test_user_id' },
      ip: '127.0.0.1',
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it('should return 400 if lat or lng are missing', async () => {
    mockReq.query = { lat: '12.9716' }; // lng is missing

    await getAdListings(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Latitude and longitude are required',
    });
  });

  it('should return 500 if an error occurs', async () => {
    mockReq.query = { lat: '12.9716', lng: '77.5946' };

    Partner.aggregate.mockRejectedValue(new Error('Database error'));

    await getAdListings(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Database error',
    });
  });

  it('should fetch and return ranked ad listings', async () => {
    mockReq.query = { lat: '12.9716', lng: '77.5946', radius: '5' };

    // Mock resetDailyBudgetsIfNeeded
    AdCampaign.updateMany.mockResolvedValue({ modifiedCount: 1 });

    const partnerId1 = 'partner1';
    const partnerId2 = 'partner2';

    Partner.aggregate.mockResolvedValue([
      { _id: partnerId1, distance: 2.5 },
      { _id: partnerId2, distance: 4.1 },
    ]);

    const mockCampaign1 = {
      _id: 'camp1',
      partner: { _id: partnerId1, businessName: 'Tiffin 1', rating: { average: 4 } },
      maxBidPerClick: 10,
      toObject: jest.fn().mockReturnValue({ _id: 'camp1', maxBidPerClick: 10 }),
    };

    const mockCampaign2 = {
      _id: 'camp2',
      partner: { _id: partnerId2, businessName: 'Tiffin 2', rating: { average: 4.5 } },
      maxBidPerClick: 5,
      toObject: jest.fn().mockReturnValue({ _id: 'camp2', maxBidPerClick: 5 }),
    };

    AdCampaign.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([mockCampaign1, mockCampaign2]),
    });

    // camp1 has 3 impressions (should be filtered out)
    // camp2 has 1 impression (should be kept)
    AdImpression.aggregate.mockResolvedValue([
      { _id: 'camp1', count: 3 },
      { _id: 'camp2', count: 1 },
    ]);

    await getAdListings(mockReq, mockRes);

    expect(AdCampaign.updateMany).toHaveBeenCalled();
    expect(Partner.aggregate).toHaveBeenCalled();
    expect(AdCampaign.find).toHaveBeenCalled();
    expect(AdImpression.aggregate).toHaveBeenCalled();

    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      data: {
        sponsored: [
          {
            _id: 'camp2',
            maxBidPerClick: 5,
            distance: 4.1,
            rankScore: 22.5, // 5 * 4.5
          },
        ],
      },
    });
  });

  it('should sort campaigns by rankScore and limit to 3', async () => {
    mockReq.query = { lat: '12.9716', lng: '77.5946' };

    AdCampaign.updateMany.mockResolvedValue({ modifiedCount: 0 });

    const partnerId1 = 'partner1';
    const partnerId2 = 'partner2';
    const partnerId3 = 'partner3';
    const partnerId4 = 'partner4';

    Partner.aggregate.mockResolvedValue([
      { _id: partnerId1, distance: 2.5 },
      { _id: partnerId2, distance: 4.1 },
      { _id: partnerId3, distance: 1.1 },
      { _id: partnerId4, distance: 3.2 },
    ]);

    const mockCampaigns = [
      {
        _id: 'camp1',
        partner: { _id: partnerId1, rating: { average: 3 } }, // rank: 30
        maxBidPerClick: 10,
        toObject: jest.fn().mockReturnValue({ _id: 'camp1' }),
      },
      {
        _id: 'camp2',
        partner: { _id: partnerId2, rating: { average: 5 } }, // rank: 40
        maxBidPerClick: 8,
        toObject: jest.fn().mockReturnValue({ _id: 'camp2' }),
      },
      {
        _id: 'camp3',
        partner: { _id: partnerId3, rating: { average: 4 } }, // rank: 20
        maxBidPerClick: 5,
        toObject: jest.fn().mockReturnValue({ _id: 'camp3' }),
      },
      {
        _id: 'camp4',
        partner: { _id: partnerId4, rating: { average: 4 } }, // rank: 24
        maxBidPerClick: 6,
        toObject: jest.fn().mockReturnValue({ _id: 'camp4' }),
      },
    ];

    AdCampaign.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockCampaigns),
    });

    AdImpression.aggregate.mockResolvedValue([]);

    await getAdListings(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          sponsored: [
            expect.objectContaining({ _id: 'camp2', rankScore: 40 }),
            expect.objectContaining({ _id: 'camp1', rankScore: 30 }),
            expect.objectContaining({ _id: 'camp4', rankScore: 24 }),
          ], // camp3 should be excluded because only top 3 are returned
        },
      }),
    );
  });
});
