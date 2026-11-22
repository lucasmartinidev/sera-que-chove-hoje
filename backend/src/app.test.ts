import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app';

describe('GET /health', () => {
  it('TI-08 permanece saudável e inclui timestamp após as mudanças', async () => {
    const response = await request(createApp()).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(Date.parse(response.body.timestamp)).not.toBeNaN();
  });
});
