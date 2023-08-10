import { httpClient } from '@/lib/services/httpClient';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);

describe('HTTP Client', () => {
  beforeEach(() => {
    mock.reset();
  });

  it('should handle successful requests', async () => {
    const htmlContent = '<!DOCTYPE html><html><body>Test</body></html>';
    mock.onGet('https://example.com').reply(200, htmlContent);

    const result = await httpClient.get('https://example.com');
    
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(200);
    expect(result.data).toBe(htmlContent);
  });

  it('should handle failed requests', async () => {
    mock.onGet('https://example.com/error').reply(500);

    const result = await httpClient.get('https://example.com/error');
    
    expect(result.error).toBeDefined();
    expect(result.status).toBe(500);
  });

  it('should handle network errors', async () => {
    mock.onGet('https://example.com/timeout').networkError();

    const result = await httpClient.get('https://example.com/timeout');
    
    expect(result.error).toBeDefined();
    expect(result.data).toBeUndefined();
  });
}); 