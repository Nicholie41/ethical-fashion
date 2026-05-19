const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Order = require('../models/Order');
const bcrypt = require('bcrypt');

describe('Integration Tests - Complete User Journey', () => {
  let customerToken, supplierToken, adminToken;
  let testBrand, testProduct;

  beforeEach(async () => {
    // Create test brand
    testBrand = new Brand(testUtils.createTestBrand());
    await testBrand.save();

    // Create test users
    const customerData = testUtils.createTestUser({ role: 'customer' });
    const supplierData = testUtils.createTestUser({ role: 'supplier' });
    const adminData = testUtils.createTestUser({ role: 'admin' });

    const customer = new User({
      ...customerData,
      passwordHash: await bcrypt.hash(customerData.password, 10)
    });
    await customer.save();

    const supplier = new User({
      ...supplierData,
      passwordHash: await bcrypt.hash(supplierData.password, 10)
    });
    await supplier.save();

    const admin = new User({
      ...adminData,
      passwordHash: await bcrypt.hash(adminData.password, 10)
    });
    await admin.save();

    // Generate tokens
    customerToken = testUtils.generateTestToken({
      id: customer._id,
      username: customer.username,
      role: 'customer'
    });

    supplierToken = testUtils.generateTestToken({
      id: supplier._id,
      username: supplier.username,
      role: 'supplier'
    });

    adminToken = testUtils.generateTestToken({
      id: admin._id,
      username: admin.username,
      role: 'admin'
    });
  });

  describe('Complete E-commerce Flow', () => {
    it('should handle complete product lifecycle: creation → approval → purchase → gamification', async () => {
      // 1. Supplier creates a product
      const productData = testUtils.createTestProduct({
        name: 'Sustainable T-Shirt',
        price: 35.00,
        sustainabilityScore: 9,
        brand: testBrand._id
      });

      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${supplierToken}`)
        .field('name', productData.name)
        .field('description', productData.description)
        .field('price', productData.price)
        .field('material', productData.material)
        .field('category', productData.category)
        .field('brand', productData.brand)
        .field('sizes', JSON.stringify(productData.sizes))
        .field('colors', JSON.stringify(productData.colors))
        .expect(201);

      expect(createResponse.body.approved).toBe(false); // Pending approval
      testProduct = createResponse.body;

      // 2. Admin approves the product
      const approveResponse = await request(app)
        .put(`/api/products/admin/products/${testProduct._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(approveResponse.body.product.approved).toBe(true);

      // 3. Customer browses products and finds the approved product
      const browseResponse = await request(app)
        .get('/api/products?approved=true')
        .expect(200);

      expect(browseResponse.body.products).toHaveLength(1);
      expect(browseResponse.body.products[0].name).toBe('Sustainable T-Shirt');

      // 4. Customer views product details (incrementing analytics)
      await request(app)
        .post(`/api/products/${testProduct._id}/view`)
        .expect(200);

      // 5. Customer makes a purchase (simulated order creation)
      const orderData = {
        items: [{
          productId: testProduct._id,
          quantity: 2,
          price: testProduct.price
        }],
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'credit_card',
        total: testProduct.price * 2
      };

      const orderResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(orderData)
        .expect(201);

      expect(orderResponse.body.status).toBe('pending');

      // 6. Track gamification activities
      const gamificationResponse = await request(app)
        .post('/api/gamification/track-activity')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          type: 'purchase',
          productId: testProduct._id,
          amount: testProduct.price * 2,
          metadata: {
            sustainabilityScore: testProduct.sustainabilityScore
          }
        })
        .expect(200);

      expect(gamificationResponse.body.pointsAwarded).toBeGreaterThan(0);

      // 7. Check updated gamification profile
      const profileResponse = await request(app)
        .get('/api/gamification/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(profileResponse.body.points).toBeGreaterThan(0);
      expect(profileResponse.body.achievements.length).toBeGreaterThan(0);

      // 8. Supplier checks their stats
      const statsResponse = await request(app)
        .get('/api/products/mine/stats')
        .set('Authorization', `Bearer ${supplierToken}`)
        .expect(200);

      expect(statsResponse.body.totalProducts).toBe(1);
      expect(statsResponse.body.approvedProducts).toBe(1);
      expect(statsResponse.body.totalSales).toBe(2); // 2 items sold
      expect(statsResponse.body.totalRevenue).toBe(testProduct.price * 2);
    });

    it('should handle product search and filtering with sustainability focus', async () => {
      // Create multiple products with different sustainability scores
      const products = [
        {
          name: 'Organic Cotton Shirt',
          price: 45.00,
          sustainabilityScore: 9,
          category: 'T-Shirts',
          material: 'Organic Cotton'
        },
        {
          name: 'Recycled Polyester Jacket',
          price: 85.00,
          sustainabilityScore: 7,
          category: 'Jackets',
          material: 'Recycled Polyester'
        },
        {
          name: 'Hemp Pants',
          price: 65.00,
          sustainabilityScore: 10,
          category: 'Pants',
          material: 'Hemp'
        }
      ];

      // Create products
      for (const productData of products) {
        await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${supplierToken}`)
          .field('name', productData.name)
          .field('price', productData.price)
          .field('material', productData.material)
          .field('category', productData.category)
          .field('brand', testBrand._id)
          .field('sizes', JSON.stringify(['S', 'M', 'L']))
          .field('colors', JSON.stringify(['Black', 'White']))
          .expect(201);
      }

      // Approve all products
      const allProducts = await Product.find({ uploader: supplierToken.id });
      for (const product of allProducts) {
        await request(app)
          .put(`/api/products/admin/products/${product._id}/approve`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      }

      // Test sustainability-focused search
      const sustainabilityResponse = await request(app)
        .get('/api/products?minSustainability=8&sortBy=sustainability')
        .expect(200);

      expect(sustainabilityResponse.body.products).toHaveLength(2);
      expect(sustainabilityResponse.body.products[0].sustainabilityScore).toBe(10);
      expect(sustainabilityResponse.body.products[1].sustainabilityScore).toBe(9);

      // Test material-based search
      const materialResponse = await request(app)
        .get('/api/products?materials=Organic Cotton')
        .expect(200);

      expect(materialResponse.body.products).toHaveLength(1);
      expect(materialResponse.body.products[0].material).toBe('Organic Cotton');

      // Test price range filtering
      const priceResponse = await request(app)
        .get('/api/products?minPrice=50&maxPrice=70')
        .expect(200);

      expect(priceResponse.body.products).toHaveLength(1);
      expect(priceResponse.body.products[0].name).toBe('Hemp Pants');
    });

    it('should handle user registration and profile completion flow', async () => {
      // 1. User registers
      const registerData = testUtils.createTestUser({
        username: 'newuser',
        email: 'newuser@example.com'
      });

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(registerData)
        .expect(201);

      const newUserToken = registerResponse.body.token;
      expect(registerResponse.body.user.points).toBe(50); // Welcome bonus
      expect(registerResponse.body.user.level).toBe('New');

      // 2. User completes profile preferences
      const preferencesData = {
        style: 'Casual & Comfortable',
        budget: 'Mid-range ($50-150)',
        sustainability: 'Very Important',
        colors: ['Blue', 'Green', 'Black'],
        materials: ['Organic Cotton', 'Hemp'],
        quizCompleted: true
      };

      await request(app)
        .put('/api/profile/preferences')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send(preferencesData)
        .expect(200);

      // 3. User gets personalized recommendations
      const recommendationsResponse = await request(app)
        .get('/api/personalization/recommendations')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200);

      expect(recommendationsResponse.body).toHaveProperty('recommendations');
      expect(recommendationsResponse.body).toHaveProperty('personalizationScore');

      // 4. User updates gamification preferences
      const gamificationPreferences = {
        notifications: true,
        publicProfile: true,
        showPoints: true
      };

      await request(app)
        .put('/api/gamification/preferences')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send(gamificationPreferences)
        .expect(200);

      // 5. Check complete user profile
      const profileResponse = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200);

      expect(profileResponse.body.preferences.quizCompleted).toBe(true);
      expect(profileResponse.body.preferences.sustainability).toBe('Very Important');
    });

    it('should handle supplier onboarding and product management', async () => {
      // 1. Supplier registers
      const supplierData = testUtils.createTestUser({
        username: 'newsupplier',
        email: 'supplier@example.com',
        role: 'supplier'
      });

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(supplierData)
        .expect(201);

      const newSupplierToken = registerResponse.body.token;

      // 2. Supplier creates their first product
      const productData = testUtils.createTestProduct({
        name: 'Supplier Debut Product',
        brand: testBrand._id
      });

      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${newSupplierToken}`)
        .field('name', productData.name)
        .field('description', productData.description)
        .field('price', productData.price)
        .field('material', productData.material)
        .field('category', productData.category)
        .field('brand', productData.brand)
        .field('sizes', JSON.stringify(productData.sizes))
        .field('colors', JSON.stringify(productData.colors))
        .expect(201);

      expect(createResponse.body.approved).toBe(false);

      // 3. Supplier checks their products
      const myProductsResponse = await request(app)
        .get('/api/products/mine')
        .set('Authorization', `Bearer ${newSupplierToken}`)
        .expect(200);

      expect(myProductsResponse.body).toHaveLength(1);
      expect(myProductsResponse.body[0].name).toBe('Supplier Debut Product');

      // 4. Supplier checks their stats
      const statsResponse = await request(app)
        .get('/api/products/mine/stats')
        .set('Authorization', `Bearer ${newSupplierToken}`)
        .expect(200);

      expect(statsResponse.body.totalProducts).toBe(1);
      expect(statsResponse.body.approvedProducts).toBe(0);
      expect(statsResponse.body.pendingProducts).toBe(1);

      // 5. Admin approves the product
      await request(app)
        .put(`/api/products/admin/products/${createResponse.body._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // 6. Supplier checks updated stats
      const updatedStatsResponse = await request(app)
        .get('/api/products/mine/stats')
        .set('Authorization', `Bearer ${newSupplierToken}`)
        .expect(200);

      expect(updatedStatsResponse.body.approvedProducts).toBe(1);
      expect(updatedStatsResponse.body.pendingProducts).toBe(0);
    });

    it('should handle error scenarios and edge cases', async () => {
      // Test invalid authentication
      await request(app)
        .get('/api/products/mine')
        .expect(401);

      // Test invalid authorization
      await request(app)
        .get('/api/products/mine')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      // Test invalid product ID
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      // Test malformed request data
      await request(app)
        .post('/api/auth/register')
        .send({ invalid: 'data' })
        .expect(400);

      // Test duplicate username registration
      const userData = testUtils.createTestUser();
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      // Test invalid JWT token
      await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });

    it('should handle concurrent operations and data consistency', async () => {
      // Create a product
      const productData = testUtils.createTestProduct({
        brand: testBrand._id
      });

      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${supplierToken}`)
        .field('name', productData.name)
        .field('price', productData.price)
        .field('material', productData.material)
        .field('category', productData.category)
        .field('brand', productData.brand)
        .field('sizes', JSON.stringify(productData.sizes))
        .field('colors', JSON.stringify(productData.colors))
        .expect(201);

      // Simulate concurrent view increments
      const concurrentViews = Array(5).fill().map(() =>
        request(app)
          .post(`/api/products/${createResponse.body._id}/view`)
          .expect(200)
      );

      await Promise.all(concurrentViews);

      // Verify final view count
      const finalProduct = await Product.findById(createResponse.body._id);
      expect(finalProduct.views).toBe(5);

      // Test concurrent gamification point awards
      const concurrentAwards = Array(3).fill().map(() =>
        request(app)
          .post('/api/gamification/award-points')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({ points: 10, reason: 'Concurrent test' })
          .expect(200)
      );

      await Promise.all(concurrentAwards);

      // Verify final point count
      const finalUser = await User.findById(customerToken.id);
      expect(finalUser.points).toBeGreaterThan(0);
    });
  });

  describe('API Health and Performance', () => {
    it('should return health check information', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('version');
    });

    it('should return API documentation', async () => {
      const response = await request(app)
        .get('/api/docs')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('endpoints');
    });

    it('should handle 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });
  });
}); 