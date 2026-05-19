const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');

describe('Authentication Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new customer user successfully', async () => {
      const userData = testUtils.createTestUser();

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.role).toBe('customer');
      expect(response.body.user.points).toBe(50); // Welcome bonus
      expect(response.body.user.level).toBe('New');

      // Verify user was saved to database
      const savedUser = await User.findOne({ username: userData.username });
      expect(savedUser).toBeTruthy();
      expect(savedUser.role).toBe('customer');
      expect(savedUser.points).toBe(50);
      expect(savedUser.achievements).toHaveLength(1);
      expect(savedUser.achievements[0].id).toBe('welcome');
    });

    it('should register a supplier user successfully', async () => {
      const userData = testUtils.createTestUser({ role: 'supplier' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user.role).toBe('supplier');
      expect(response.body.user.points).toBe(50);
    });

    it('should not allow admin registration via public endpoint', async () => {
      const userData = testUtils.createTestUser({ role: 'admin' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Should default to customer role
      expect(response.body.user.role).toBe('customer');
    });

    it('should return 400 for missing username', async () => {
      const userData = { password: 'testpassword123' };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Missing username or password');
    });

    it('should return 400 for missing password', async () => {
      const userData = { username: 'testuser' };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Missing username or password');
    });

    it('should return 409 for duplicate username', async () => {
      const userData = testUtils.createTestUser();

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same username
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.error).toBe('Username already taken');
    });

    it('should hash password before saving', async () => {
      const userData = testUtils.createTestUser();

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const savedUser = await User.findOne({ username: userData.username });
      expect(savedUser.passwordHash).not.toBe(userData.password);
      
      // Verify password was hashed correctly
      const isValidPassword = await bcrypt.compare(userData.password, savedUser.passwordHash);
      expect(isValidPassword).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user for login tests
      const userData = testUtils.createTestUser();
      const passwordHash = await bcrypt.hash(userData.password, 10);
      testUser = new User({
        username: userData.username,
        passwordHash,
        email: userData.email,
        role: userData.role
      });
      await testUser.save();
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        username: testUser.username,
        password: 'testpassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.user.role).toBe(testUser.role);

      // Verify token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.username).toBe(testUser.username);
      expect(decoded.role).toBe(testUser.role);
    });

    it('should return 400 for non-existent username', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'testpassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.error).toBe('Invalid username or password');
    });

    it('should return 401 for incorrect password', async () => {
      const loginData = {
        username: testUser.username,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid username or password');
    });

    it('should return 403 for invalid user role', async () => {
      // Create user with invalid role
      const invalidUser = new User({
        username: 'invaliduser',
        passwordHash: await bcrypt.hash('password123', 10),
        email: 'invalid@example.com',
        role: 'invalid_role'
      });
      await invalidUser.save();

      const loginData = {
        username: 'invaliduser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(403);

      expect(response.body.error).toBe('Invalid user role.');
    });

    it('should handle case-insensitive role comparison', async () => {
      // Create user with uppercase role
      const uppercaseUser = new User({
        username: 'uppercaseuser',
        passwordHash: await bcrypt.hash('password123', 10),
        email: 'uppercase@example.com',
        role: 'CUSTOMER'
      });
      await uppercaseUser.save();

      const loginData = {
        username: 'uppercaseuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.user.role).toBe('customer'); // Should be lowercase
    });
  });

  describe('Token Validation', () => {
    it('should generate valid JWT tokens', async () => {
      const userData = testUtils.createTestUser();

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const token = response.body.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded).toHaveProperty('username');
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('role');
      expect(decoded.username).toBe(userData.username);
      expect(decoded.role).toBe('customer');
    });

    it('should handle missing JWT_SECRET gracefully', async () => {
      // Temporarily remove JWT_SECRET
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const userData = testUtils.createTestUser();

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');

      // Restore JWT_SECRET
      process.env.JWT_SECRET = originalSecret;
    });
  });
}); 