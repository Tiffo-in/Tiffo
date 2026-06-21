const { getTiffins, getTiffin } = require('../tiffinController');
const Tiffin = require('../../models/Tiffin');

jest.mock('../../models/Tiffin');

jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Tiffin Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      query: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTiffins', () => {
    it('should return 200 and paginated tiffins', async () => {
      const mockTiffins = [
        { _id: '1', name: 'Tiffin 1', rating: { average: 4.5 } },
        { _id: '2', name: 'Tiffin 2', rating: { average: 4.0 } },
      ];

      Tiffin.countDocuments.mockResolvedValue(2);
      Tiffin.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockTiffins),
      });

      mockReq.query = { page: '1', limit: '10' };

      await getTiffins(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
          pagination: expect.objectContaining({
            page: 1,
            total: 2,
          }),
        }),
      );
    });

    it('should return 400 if an error occurs', async () => {
      Tiffin.countDocuments.mockRejectedValue(new Error('DB Error'));

      await getTiffins(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'DB Error',
        }),
      );
    });
  });

  describe('getTiffin', () => {
    const validId = '507f1f77bcf86cd799439011';

    it('should return 200 and the tiffin if found by ID', async () => {
      const mockTiffin = { _id: validId, name: 'Tiffin 1' };
      Tiffin.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTiffin),
      });
      mockReq.params.id = validId;

      await getTiffin(mockReq, mockRes);

      expect(Tiffin.findById).toHaveBeenCalledWith(validId);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockTiffin,
        }),
      );
    });

    it('should return 200 and the tiffin if found by slug', async () => {
      const mockTiffin = { _id: validId, slug: 'tiffin-1', name: 'Tiffin 1' };
      Tiffin.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTiffin),
      });
      mockReq.params.id = 'tiffin-1';

      await getTiffin(mockReq, mockRes);

      expect(Tiffin.findOne).toHaveBeenCalledWith({ slug: 'tiffin-1' });
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockTiffin,
        }),
      );
    });

    it('should return 404 if tiffin not found by ID', async () => {
      Tiffin.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      mockReq.params.id = validId;

      await getTiffin(mockReq, mockRes);

      expect(Tiffin.findById).toHaveBeenCalledWith(validId);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Tiffin not found',
        }),
      );
    });

    it('should return 404 if tiffin not found by slug', async () => {
      Tiffin.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      mockReq.params.id = 'nonexistent-slug';

      await getTiffin(mockReq, mockRes);

      expect(Tiffin.findOne).toHaveBeenCalledWith({ slug: 'nonexistent-slug' });
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Tiffin not found',
        }),
      );
    });
  });
});
