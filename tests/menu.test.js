const request = require('supertest');
const app = require('../server'); // need to export app without listen

// For testing, you may want to export app separately and use a test DB.
// Simplified example:
describe('Menu API', () => {
  it('GET /api/menu should return 200 and array', async () => {
    const res = await request(app).get('/api/menu');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});