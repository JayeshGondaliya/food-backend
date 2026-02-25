const request = require('supertest');
const app = require('../server');

describe('Order API', () => {
  it('POST /api/orders should create order', async () => {
    const newOrder = {
      items: [{ menuItemId: 'someid', quantity: 2 }],
      customerName: 'John',
      address: '123 St',
      phone: '1234567890'
    };
    const res = await request(app)
      .post('/api/orders')
      .send(newOrder);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
  });
});