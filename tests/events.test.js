const request = require('supertest');
const app = require('../server');

let server;

beforeAll(() => {
    server = app.listen(4000); // Use a different port for testing
});

afterAll((done) => {
    server.close(done); // Ensure the server closes after tests
});

test('Check if server is running', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(404); // Change this based on actual behavior
});
