const {
  updateDeliveryStatus,
  getDeliveryDetails,
  getPartnerDeliveries,
  getDeliveryStats,
  batchUpdateDeliveries,
  getAdminDeliveries,
} = require('../deliveryController');
const Delivery = require('../../models/Delivery');
const Subscription = require('../../models/Subscription');
const { emitDeliveryUpdate } = require('../../services/socketService');

jest.mock('../../models/Delivery');
jest.mock('../../models/Subscription');
jest.mock('../../services/socketService');
jest.mock('../../utils/logger');

describe('Delivery Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
      user: { id: 'partner_id_123', _id: 'partner_id_123', role: 'partner' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getDeliveryDetails', () => {
    it('should return 200 and delivery data on success', async () => {
      req.params.deliveryId = 'del_123';
      const mockDelivery = {
        _id: 'del_123',
        user: { _id: 'u1', name: 'John Doe', phone: '123', address: '123 Main St' },
        subscription: { _id: 's1', plan: 'Weekly' },
        partner: { _id: 'p1', businessName: 'Tiffins Co.', phone: '987' }
      };

      Delivery.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockDelivery)
          })
        })
      });

      await getDeliveryDetails(req, res);

      expect(Delivery.findById).toHaveBeenCalledWith('del_123');
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockDelivery });
    });

    it('should return 404 if delivery not found', async () => {
      req.params.deliveryId = 'del_missing';

      Delivery.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(null)
          })
        })
      });

      await getDeliveryDetails(req, res);

      expect(Delivery.findById).toHaveBeenCalledWith('del_missing');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'Delivery not found' }));
    });

    it('should return 500 on database error', async () => {
      req.params.deliveryId = 'del_error';

      Delivery.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockRejectedValue(new Error('Database query failed'))
          })
        })
      });

      await getDeliveryDetails(req, res);

      expect(Delivery.findById).toHaveBeenCalledWith('del_error');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'Database query failed' }));
    });
  });

  describe('updateDeliveryStatus', () => {
    it('should update status and return 200 on success', async () => {
      req.params.deliveryId = 'del_1';
      req.body = { status: 'delivered', notes: 'Left at gate' };

      const mockDelivery = {
        _id: 'del_1',
        status: 'delivered',
        user: { _id: 'user_1', name: 'John' },
      };

      Delivery.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDelivery),
      });

      // Simple mock for non-chained populate if used directly
      Delivery.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockDelivery),
        }),
      });

      await updateDeliveryStatus(req, res);

      expect(Delivery.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'del_1', partner: 'partner_id_123' },
        expect.objectContaining({ status: 'delivered' }),
        { new: true },
      );
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      expect(emitDeliveryUpdate).toHaveBeenCalled();
    });

    it('should return 404 if delivery not found or not owned by partner', async () => {
      req.params.deliveryId = 'del_wrong';
      Delivery.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      });

      await updateDeliveryStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });

  describe('getPartnerDeliveries', () => {
    it('should return paginated deliveries for partner', async () => {
      req.query = { page: '1', limit: '10' };

      Delivery.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ _id: 'd1' }]),
      });
      Delivery.countDocuments.mockResolvedValue(1);

      await getPartnerDeliveries(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          pagination: expect.objectContaining({ total: 1 }),
        }),
      );
    });
  });

  describe('batchUpdateDeliveries', () => {
    it('should return 400 if batch size exceeds 100', async () => {
      req.body = {
        deliveryIds: Array(101).fill('id'),
        status: 'delivered',
      };

      await batchUpdateDeliveries(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Batch size too large. Maximum 100 IDs per request allowed.',
        }),
      );
      expect(Delivery.updateMany).not.toHaveBeenCalled();
    });

    it('should update many and return modified count on success', async () => {
      req.body = {
        deliveryIds: ['id1', 'id2'],
        status: 'preparing',
      };

      Delivery.updateMany.mockResolvedValue({ modifiedCount: 2 });
      Delivery.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([{ _id: 'id1', user: { _id: 'u1' } }]),
      });

      await batchUpdateDeliveries(req, res);

      expect(Delivery.updateMany).toHaveBeenCalledWith(
        { _id: { $in: ['id1', 'id2'] }, partner: 'partner_id_123' },
        expect.anything(),
      );
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ modifiedCount: 2 }));
    });
  });

  describe('getAdminDeliveries', () => {
    it('should use aggregation pipeline when search is provided', async () => {
      req.query = { search: 'John' };
      req.user.role = 'admin';

      Delivery.aggregate.mockResolvedValueOnce([{ _id: 'agg1' }]); // data
      Delivery.aggregate.mockResolvedValueOnce([{ total: 1 }]); // count

      await getAdminDeliveries(req, res);

      expect(Delivery.aggregate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should use find/populate when no search matches', async () => {
      req.query = {};
      req.user.role = 'admin';

      Delivery.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });
      Delivery.countDocuments.mockResolvedValue(0);

      await getAdminDeliveries(req, res);

      expect(Delivery.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });
  });
});
