const request = require('supertest');
const { app } = require('../server');

describe('API Health Check', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
  });

  test('GET / should return API info', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);
    
    expect(response.body.message).toBe('Task Manager API');
    expect(response.body.version).toBe('1.0.0');
  });
});

describe('Authentication API', () => {
  test('POST /api/auth/register should validate input', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: '123',
        firstName: '',
        lastName: ''
      })
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Validation failed');
  });

  test('POST /api/auth/login should validate input', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid-email',
        password: ''
      })
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Validation failed');
  });
});

describe('Quote API', () => {
  test('GET /api/quotes/random should return a quote', async () => {
    const response = await request(app)
      .get('/api/quotes/random')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.quote).toBeDefined();
    expect(response.body.data.quote.text).toBeDefined();
    expect(response.body.data.quote.author).toBeDefined();
  });

  test('GET /api/quotes/daily should return daily quote', async () => {
    const response = await request(app)
      .get('/api/quotes/daily')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.quote).toBeDefined();
  });
});

describe('Protected Routes', () => {
  test('GET /api/tasks should require authentication', async () => {
    const response = await request(app)
      .get('/api/tasks')
      .expect(401);
    
    expect(response.body.error).toContain('Access denied');
  });

  test('POST /api/ai/tip should require authentication', async () => {
    const response = await request(app)
      .post('/api/ai/tip')
      .send({
        taskDescription: 'Test task description'
      })
      .expect(401);
    
    expect(response.body.error).toContain('Access denied');
  });
});
