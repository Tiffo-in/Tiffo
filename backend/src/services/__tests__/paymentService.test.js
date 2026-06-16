const { fetchPaymentHistory } = require('../paymentService');
const PaymentLog = require('../../models/PaymentLog');

jest.mock('../../models/User');
jest.mock('../../models/Partner');
jest.mock('../../models/Subscription');
jest.mock('../../models/PaymentLog');
jest.mock('../razorpayService');
jest.mock('../deliveryService');
jest.mock('../socketService');

describe('paymentService - fetchPaymentHistory', () => {
  const userId = 'user123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createQueryMock = (mockPayments) => {
    const chain = {};
    chain.sort = jest.fn().mockReturnValue(chain);
    chain.limit = jest.fn().mockReturnValue(chain);
    chain.skip = jest.fn().mockReturnValue(chain);
    chain.populate = jest.fn().mockReturnValue(chain);
    chain.then = jest.fn((cb) => cb(mockPayments));
    return chain;
  };

  it('should apply default pagination (limit=20, page=1) when no arguments are provided', async () => {
    const mockPayments = [];
    const chain = createQueryMock(mockPayments);

    // First call to find is for paginated result, second is for summaryStats
    PaymentLog.find.mockImplementationOnce(() => chain).mockResolvedValueOnce([]);

    PaymentLog.countDocuments.mockResolvedValue(0);

    const result = await fetchPaymentHistory(userId, {});

    expect(chain.limit).toHaveBeenCalledWith(20);
    expect(chain.skip).toHaveBeenCalledWith(0);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.pages).toBe(0);
  });

  it('should fallback to minimum limit of 1 and page of 1 when provided negative or zero values', async () => {
    const mockPayments = [];
    const chain = createQueryMock(mockPayments);

    // Setup for find query chain
    PaymentLog.find.mockImplementationOnce(() => chain).mockResolvedValueOnce([]);

    PaymentLog.countDocuments.mockResolvedValue(0);

    const result = await fetchPaymentHistory(userId, { limit: 0, page: -5 });

    expect(chain.limit).toHaveBeenCalledWith(1); // Math.max(1, 0) => 1
    expect(chain.skip).toHaveBeenCalledWith(0); // Math.max(1, -5) => 1 => (1-1)*1 => 0
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.pages).toBe(0);
  });

  it('should parse valid string inputs into safe integers for limit and page', async () => {
    const mockPayments = [];
    const chain = createQueryMock(mockPayments);

    PaymentLog.find.mockImplementationOnce(() => chain).mockResolvedValueOnce([]);

    PaymentLog.countDocuments.mockResolvedValue(50);

    const result = await fetchPaymentHistory(userId, { limit: '10', page: '3' });

    expect(chain.limit).toHaveBeenCalledWith(10);
    // page 3 -> (3-1) * 10 = 20
    expect(chain.skip).toHaveBeenCalledWith(20);
    expect(result.pagination.page).toBe(3);
    expect(result.pagination.pages).toBe(5);
  });
});
