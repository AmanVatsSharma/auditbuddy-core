import { cacheService } from '@/lib/services/cache';
import { redis } from '@/lib/config/redis';

jest.mock('@/lib/config/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

describe('Cache Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get cached data', async () => {
    const mockData = { foo: 'bar' };
    (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

    const result = await cacheService.get('test-key');
    
    expect(result).toEqual(mockData);
    expect(redis.get).toHaveBeenCalledWith('test-key');
  });

  it('should handle cache miss', async () => {
    (redis.get as jest.Mock).mockResolvedValue(null);

    const result = await cacheService.get('missing-key');
    
    expect(result).toBeNull();
  });
}); 