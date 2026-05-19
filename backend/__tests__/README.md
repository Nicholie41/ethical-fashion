# Ethical Fashion Platform - Testing Documentation

## Overview

This directory contains the comprehensive test suite for the Ethical Fashion Platform backend API. The tests are designed to ensure reliability, security, and functionality across all critical business operations.

## Test Architecture

### Test Framework
- **Jest**: Primary testing framework
- **Supertest**: HTTP assertion library for API testing
- **MongoDB Memory Server**: In-memory database for isolated testing

### Test Structure
```
__tests__/
├── setup.js              # Global test configuration
├── auth.test.js          # Authentication tests
├── products.test.js      # Product management tests
├── gamification.test.js  # Gamification system tests
├── integration.test.js   # End-to-end integration tests
├── run-tests.js          # Test runner with reporting
└── README.md            # This documentation
```

## Quick Start

### Prerequisites
```bash
npm install
```

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test:coverage

# Run specific test categories
npm run test:auth
npm run test:products
npm run test:gamification
npm run test:integration

# Run with detailed reporting
npm run test:report
```

## Test Categories

### 1. Authentication Tests (`auth.test.js`)

Tests user registration, login, and token management:

```javascript
describe('Authentication Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new customer user successfully', async () => {
      // Test implementation
    });
  });
});
```

**Coverage:**
- User registration with role validation
- Password hashing and security
- JWT token generation
- Login credential verification
- Error handling for invalid inputs

### 2. Products API Tests (`products.test.js`)

Tests product management and e-commerce functionality:

```javascript
describe('Products API', () => {
  describe('GET /api/products', () => {
    it('should return all approved products', async () => {
      // Test implementation
    });
  });
});
```

**Coverage:**
- Product CRUD operations
- Advanced filtering and search
- Sustainability score computation
- Supplier dashboard functionality
- Admin approval workflow
- Product analytics tracking

### 3. Gamification Tests (`gamification.test.js`)

Tests the gamification and engagement system:

```javascript
describe('Gamification API', () => {
  describe('POST /api/gamification/award-points', () => {
    it('should award points to user', async () => {
      // Test implementation
    });
  });
});
```

**Coverage:**
- Points and level progression
- Achievement unlocking system
- Badge awarding mechanism
- Streak tracking and bonuses
- Leaderboard functionality
- Activity tracking integration

### 4. Integration Tests (`integration.test.js`)

Tests complete user journeys and cross-module functionality:

```javascript
describe('Integration Tests - Complete User Journey', () => {
  it('should handle complete product lifecycle', async () => {
    // End-to-end test implementation
  });
});
```

**Coverage:**
- Complete e-commerce user journey
- Cross-module functionality
- Error handling and edge cases
- Concurrent operation handling
- API health and performance

## Test Utilities

### Global Test Utilities (`setup.js`)

The test setup provides global utilities for consistent test data:

```javascript
global.testUtils = {
  createTestUser: (overrides = {}) => ({
    username: 'testuser',
    password: 'testpassword123',
    email: 'test@example.com',
    role: 'customer',
    ...overrides
  }),

  createTestProduct: (overrides = {}) => ({
    name: 'Test Product',
    price: 29.99,
    material: 'Organic Cotton',
    // ... other defaults
    ...overrides
  }),

  generateTestToken: (userData = {}) => {
    // Generate JWT token for testing
  }
};
```

### Database Setup

Tests use MongoDB Memory Server for isolated testing:

```javascript
beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to test database
  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});
```

## Test Examples

### Authentication Test Example

```javascript
it('should register a new customer user successfully', async () => {
  const userData = testUtils.createTestUser();

  const response = await request(app)
    .post('/api/auth/register')
    .send(userData)
    .expect(201);

  expect(response.body).toHaveProperty('token');
  expect(response.body.user.role).toBe('customer');
  expect(response.body.user.points).toBe(50); // Welcome bonus
});
```

### Product Management Test Example

```javascript
it('should allow supplier to create product', async () => {
  const productData = testUtils.createTestProduct({
    brand: testBrand._id,
    uploader: testSupplier._id
  });

  const response = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${supplierToken}`)
    .field('name', productData.name)
    .field('price', productData.price)
    // ... other fields
    .expect(201);

  expect(response.body.approved).toBe(false); // Pending approval
});
```

### Gamification Test Example

```javascript
it('should award points and unlock achievements', async () => {
  const response = await request(app)
    .post('/api/gamification/track-activity')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      type: 'purchase',
      productId: testProduct._id,
      amount: 75.00
    })
    .expect(200);

  expect(response.body.pointsAwarded).toBeGreaterThan(0);
  expect(response.body.achievementUnlocked).toBeTruthy();
});
```

## Coverage Reports

### Running Coverage
```bash
npm run test:coverage
```

### Coverage Metrics
The test suite provides coverage for:
- **Statements**: 85%+
- **Branches**: 80%+
- **Functions**: 90%+
- **Lines**: 85%+

### Coverage Reports Location
- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Report**: `coverage/lcov.info`
- **Console Output**: Detailed coverage in terminal

## Continuous Integration

### GitHub Actions Example
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run test:coverage
      - run: npm run lint
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test",
      "pre-push": "npm run test:coverage"
    }
  }
}
```

## Best Practices

### Test Organization
1. **Group related tests** using `describe` blocks
2. **Use descriptive test names** that explain the expected behavior
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Keep tests independent** and isolated

### Data Management
1. **Use test utilities** for consistent test data
2. **Clean up after each test** to prevent interference
3. **Use realistic test data** that mirrors production scenarios
4. **Avoid hardcoded values** in test assertions

### Error Testing
1. **Test both success and failure scenarios**
2. **Verify error messages and status codes**
3. **Test edge cases and boundary conditions**
4. **Ensure graceful error handling**

### Performance Considerations
1. **Use in-memory database** for fast test execution
2. **Minimize database operations** in tests
3. **Use appropriate timeouts** for async operations
4. **Avoid unnecessary API calls** in test setup

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Ensure MongoDB Memory Server is properly installed
npm install --save-dev mongodb-memory-server
```

#### Test Timeout Issues
```javascript
// Increase timeout for slow operations
jest.setTimeout(30000);
```

#### Memory Leaks
```javascript
// Ensure proper cleanup
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

### Debug Mode
```bash
# Run tests with debug output
DEBUG=* npm test

# Run specific test with verbose output
npm test -- --verbose auth.test.js
```

## Maintenance

### Adding New Tests
1. Create test file in `__tests__/` directory
2. Follow existing naming conventions
3. Use test utilities for consistent data
4. Add appropriate coverage for new functionality

### Updating Test Data
1. Modify utilities in `setup.js`
2. Update test examples in this documentation
3. Ensure backward compatibility
4. Update coverage expectations

### Test Refactoring
1. Extract common test logic into utilities
2. Consolidate similar test cases
3. Remove redundant or obsolete tests
4. Update documentation accordingly

## Support

For questions or issues with the test suite:
1. Check this documentation
2. Review test examples
3. Examine error messages carefully
4. Consult Jest and Supertest documentation

---

**Last Updated**: ${new Date().toISOString()}
**Test Framework Version**: Jest 29.7.0, Supertest 6.3.3 