const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Create in-memory MongoDB instance for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to test database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.MONGODB_URI = mongoUri;
});

// Cleanup after each test
afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Disconnect from database
  await mongoose.disconnect();
  
  // Stop MongoDB server
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Global test utilities
global.testUtils = {
  // Generate test user data
  createTestUser: (overrides = {}) => ({
    username: 'testuser',
    password: 'testpassword123',
    email: 'test@example.com',
    role: 'customer',
    ...overrides
  }),

  // Generate test product data
  createTestProduct: (overrides = {}) => ({
    name: 'Test Product',
    description: 'A test product for testing',
    price: 29.99,
    material: 'Organic Cotton',
    materials: ['Organic Cotton'],
    category: 'T-Shirts',
    sustainabilityScore: 8,
    sizes: ['S', 'M', 'L'],
    colors: ['White', 'Black'],
    imageUrls: ['/uploads/test-image.jpg'],
    approved: true,
    ...overrides
  }),

  // Generate test brand data
  createTestBrand: (overrides = {}) => ({
    name: 'Test Brand',
    description: 'A test brand for testing',
    website: 'https://testbrand.com',
    approved: true,
    ...overrides
  }),

  // Generate JWT token for testing
  generateTestToken: (userData = {}) => {
    const jwt = require('jsonwebtoken');
    const defaultUser = {
      id: '507f1f77bcf86cd799439011',
      username: 'testuser',
      role: 'customer'
    };
    return jwt.sign(
      { ...defaultUser, ...userData },
      process.env.JWT_SECRET || 'test-jwt-secret',
      { expiresIn: '1h' }
    );
  }
}; 