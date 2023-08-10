import { analyzeTechnologies } from '@/lib/audit/analyzers/technologies';
import { mockServer } from '../../../mocks/server';
import { http } from 'msw';

describe('Technology Analyzer', () => {
  it('should detect CMS correctly', async () => {
    const result = await analyzeTechnologies('https://example.com');
    
    expect(result.success).toBe(true);
    expect(result.technologies).toContainEqual({
      name: 'WordPress 6.0',
      category: 'CMS',
      confidence: 1,
    });
  });

  it('should detect React framework', async () => {
    const result = await analyzeTechnologies('https://example.com');
    
    expect(result.technologies).toContainEqual({
      name: 'React',
      category: 'Frontend Framework',
      confidence: 0.9,
    });
  });

  it('should handle failed requests gracefully', async () => {
    // Override default handler for this test
    mockServer.use(
      http.get('https://example.com', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const result = await analyzeTechnologies('https://example.com');
    
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Failed to fetch site: Request failed with status 500');
    expect(result.technologies).toHaveLength(0);
  });
}); 