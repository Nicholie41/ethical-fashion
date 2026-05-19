const request = require('supertest');
const app = require('../app');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const User = require('../models/User');
const bcrypt = require('bcrypt');

describe('Products API', () => {
  let testBrand, testSupplier, testAdmin, customerToken, supplierToken, adminToken;

  beforeEach(async () => {
    // Create test brand
    testBrand = new Brand(testUtils.createTestBrand());
    await testBrand.save();

    // Create test users
    const supplierData = testUtils.createTestUser({ role: 'supplier' });
    const adminData = testUtils.createTestUser({ role: 'admin' });
    const customerData = testUtils.createTestUser({ role: 'customer' });

    testSupplier = new User({
      ...supplierData,
      passwordHash: await bcrypt.hash(supplierData.password, 10)
    });
    await testSupplier.save();

    testAdmin = new User({
      ...adminData,
      passwordHash: await bcrypt.hash(adminData.password, 10)
    });
    await testAdmin.save();

    // Generate tokens
    customerToken = testUtils.generateTestToken({ 
      id: customerData.id, 
      username: customerData.username, 
      role: 'customer' 
    });
    supplierToken = testUtils.generateTestToken({ 
      id: testSupplier._id, 
      username: testSupplier.username, 
      role: 'supplier' 
    });
    adminToken = testUtils.generateTestToken({ 
      id: testAdmin._id, 
      username: testAdmin.username, 
      role: 'admin' 
    });
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Create test products
      const products = [
        testUtils.createTestProduct({
          name: 'Organic Cotton T-Shirt',
          price: 25.00,
          sustainabilityScore: 9,
          category: 'T-Shirts',
          brand: testBrand._id,
          approved: true,
          uploader: testSupplier._id
        }),
        testUtils.createTestProduct({
          name: 'Hemp Jeans',
          price: 75.00,
          sustainabilityScore: 8,
          category: 'Jeans',
          brand: testBrand._id,
          approved: true,
          uploader: testSupplier._id
        }),
        testUtils.createTestProduct({
          name: 'Bamboo Socks',
          price: 15.00,
          sustainabilityScore: 7,
          category: 'Socks',
          brand: testBrand._id,
          approved: false, // Pending approval
          uploader: testSupplier._id
        })
      ];

      for (const productData of products) {
        const product = new Product(productData);
        await product.save();
      }
    });

    it('should return all approved products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.products).toHaveLength(2); // Only approved products
      expect(response.body.products.every(p => p.approved)).toBe(true);
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=20&maxPrice=50')
        .expect(200);

      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toBe('Organic Cotton T-Shirt');
    });

    it('should filter products by sustainability score', async () => {
      const response = await request(app)
        .get('/api/products?minSustainability=8')
        .expect(200);

      expect(response.body.products).toHaveLength(2);
      expect(response.body.products.every(p => p.sustainabilityScore >= 8)).toBe(true);
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=T-Shirts')
        .expect(200);

      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].category).toBe('T-Shirts');
    });

    it('should search products by name', async () => {
      const response = await request(app)
        .get('/api/products?q=Organic')
        .expect(200);

      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toContain('Organic');
    });

    it('should sort products by price ascending', async () => {
      const response = await request(app)
        .get('/api/products?sortBy=price_asc')
        .expect(200);

      const prices = response.body.products.map(p => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('should sort products by sustainability score descending', async () => {
      const response = await request(app)
        .get('/api/products?sortBy=sustainability')
        .expect(200);

      const scores = response.body.products.map(p => p.sustainabilityScore);
      expect(scores).toEqual([...scores].sort((a, b) => b - a));
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=1')
        .expect(200);

      expect(response.body.products).toHaveLength(1);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.totalPages).toBe(2);
      expect(response.body.pagination.hasNext).toBe(true);
    });

    it('should include brand information in response', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.products[0]).toHaveProperty('brand');
      expect(response.body.products[0].brand).toHaveProperty('name');
      expect(response.body.products[0].brand.name).toBe(testBrand.name);
    });
  });

  describe('POST /api/products', () => {
    it('should allow supplier to create product', async () => {
      const productData = testUtils.createTestProduct({
        brand: testBrand._id,
        uploader: testSupplier._id
      });

      const response = await request(app)
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

      expect(response.body.name).toBe(productData.name);
      expect(response.body.uploader).toBe(testSupplier._id.toString());
      expect(response.body.approved).toBe(false); // Should be pending approval
    });

    it('should auto-approve products created by admin', async () => {
      const productData = testUtils.createTestProduct({
        brand: testBrand._id,
        uploader: testAdmin._id
      });

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('name', productData.name)
        .field('description', productData.description)
        .field('price', productData.price)
        .field('material', productData.material)
        .field('category', productData.category)
        .field('brand', productData.brand)
        .field('sizes', JSON.stringify(productData.sizes))
        .field('colors', JSON.stringify(productData.colors))
        .expect(201);

      expect(response.body.approved).toBe(true);
    });

    it('should reject product creation without authentication', async () => {
      const productData = testUtils.createTestProduct();

      await request(app)
        .post('/api/products')
        .field('name', productData.name)
        .field('price', productData.price)
        .expect(401);
    });

    it('should reject product creation by customer', async () => {
      const productData = testUtils.createTestProduct();

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .field('name', productData.name)
        .field('price', productData.price)
        .expect(403);
    });

    it('should compute sustainability score automatically', async () => {
      const productData = {
        name: 'Organic Cotton Product',
        description: 'Made with organic cotton',
        price: 30.00,
        material: 'Organic Cotton',
        category: 'T-Shirts',
        brand: testBrand._id,
        sizes: ['S', 'M', 'L'],
        colors: ['White']
      };

      const response = await request(app)
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

      expect(response.body.sustainabilityScore).toBeGreaterThan(0);
    });
  });

  describe('GET /api/products/mine', () => {
    beforeEach(async () => {
      // Create products for the test supplier
      const products = [
        testUtils.createTestProduct({
          name: 'Supplier Product 1',
          brand: testBrand._id,
          uploader: testSupplier._id,
          approved: true
        }),
        testUtils.createTestProduct({
          name: 'Supplier Product 2',
          brand: testBrand._id,
          uploader: testSupplier._id,
          approved: false
        })
      ];

      for (const productData of products) {
        const product = new Product(productData);
        await product.save();
      }
    });

    it('should return supplier\'s own products', async () => {
      const response = await request(app)
        .get('/api/products/mine')
        .set('Authorization', `Bearer ${supplierToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every(p => p.uploader === testSupplier._id.toString())).toBe(true);
    });

    it('should reject access without authentication', async () => {
      await request(app)
        .get('/api/products/mine')
        .expect(401);
    });

    it('should reject access by customer', async () => {
      await request(app)
        .get('/api/products/mine')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });
  });

  describe('GET /api/products/mine/stats', () => {
    beforeEach(async () => {
      // Create products and orders for stats
      const product = new Product(testUtils.createTestProduct({
        brand: testBrand._id,
        uploader: testSupplier._id,
        approved: true
      }));
      await product.save();

      // Create a mock order (simplified for testing)
      const Order = require('../models/Order');
      const order = new Order({
        items: [{
          productId: product._id,
          quantity: 2,
          price: product.price
        }],
        status: 'completed',
        total: product.price * 2
      });
      await order.save();
    });

    it('should return supplier statistics', async () => {
      const response = await request(app)
        .get('/api/products/mine/stats')
        .set('Authorization', `Bearer ${supplierToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalProducts');
      expect(response.body).toHaveProperty('approvedProducts');
      expect(response.body).toHaveProperty('pendingProducts');
      expect(response.body).toHaveProperty('totalSales');
      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('recentOrders');
    });
  });

  describe('Product Analytics', () => {
    let testProduct;

    beforeEach(async () => {
      testProduct = new Product(testUtils.createTestProduct({
        brand: testBrand._id,
        uploader: testSupplier._id,
        approved: true
      }));
      await testProduct.save();
    });

    it('should increment product views', async () => {
      const response = await request(app)
        .post(`/api/products/${testProduct._id}/view`)
        .expect(200);

      expect(response.body.views).toBe(1);
      expect(response.body).toHaveProperty('lastViewedAt');
    });

    it('should increment product clicks', async () => {
      const response = await request(app)
        .post(`/api/products/${testProduct._id}/click`)
        .expect(200);

      expect(response.body.clicks).toBe(1);
    });

    it('should return product analytics', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct._id}/analytics`)
        .expect(200);

      expect(response.body).toHaveProperty('views');
      expect(response.body).toHaveProperty('clicks');
      expect(response.body).toHaveProperty('salesCount');
      expect(response.body).toHaveProperty('lastViewedAt');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .post(`/api/products/${fakeId}/view`)
        .expect(404);
    });
  });

  describe('Admin Endpoints', () => {
    let pendingProduct;

    beforeEach(async () => {
      pendingProduct = new Product(testUtils.createTestProduct({
        brand: testBrand._id,
        uploader: testSupplier._id,
        approved: false
      }));
      await pendingProduct.save();
    });

    it('should return pending products for admin', async () => {
      const response = await request(app)
        .get('/api/products/admin/products/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].approved).toBe(false);
    });

    it('should allow admin to approve product', async () => {
      const response = await request(app)
        .put(`/api/products/admin/products/${pendingProduct._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Product approved');
      expect(response.body.product.approved).toBe(true);
    });

    it('should reject admin actions without proper authorization', async () => {
      await request(app)
        .get('/api/products/admin/products/pending')
        .set('Authorization', `Bearer ${supplierToken}`)
        .expect(403);
    });
  });
}); 