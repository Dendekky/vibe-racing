import request from 'supertest';
import { app } from '../index';

describe('Server API', () => {
  test('GET / should return status 200', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Racing Game Server Running');
  });

  test('GET /health should return status OK', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
  });
}); 