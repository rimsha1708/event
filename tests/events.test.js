const request = require('supertest');
const app = require('../server');

test('Check if server is running', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(404);
});
