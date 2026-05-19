const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { seedDemoDataIfEmpty } = require('./demoSeed');

const app = express();

// --- Serve static uploads ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- CORS ---
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// --- JSON parser ---
app.use(express.json());

// --- Route imports ---
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const brandRoutes = require('./routes/brands');
const adminRoutes = require('./routes/admin');
const supplierRoutes = require('./routes/supplier');
const profileRoutes = require('./routes/profile');
const ordersRouter = require('./routes/orders');
const usersRoutes = require('./routes/users');
const { router: notificationsRoutes } = require('./routes/notifications');
const securityRoutes = require('./routes/security');

// --- Use routes ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', ordersRouter);
app.use('/api/brands', brandRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/security', securityRoutes);

// --- Root endpoint ---
app.get('/', (req, res) => {
  res.send('Ethical Fashion Backend is running!');
});

// --- Health check endpoint ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// --- 404 handler (keep last before error handler) ---
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// --- Connect to MongoDB and start server ---
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    // Ensure the UI has products on first run (demo mode).
    try {
      const seedResult = await seedDemoDataIfEmpty();
      if (seedResult?.seeded) {
        console.log(
          `🌱 Demo seed complete: ${seedResult.productsCount} products across ${seedResult.brandsCount} brands (admin=${seedResult.adminUsername})`
        );
      }
    } catch (err) {
      console.error('❌ Demo seed failed (continuing startup):', err?.message || err);
    }

    app.listen(PORT, () => {
      console.log('🚀 Ethical Fashion Backend Server Started!');
      console.log('📍 Server running on port:', PORT);
      console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
      console.log('📚 API Documentation: http://localhost:' + PORT + '/api/docs');
      console.log('❤️  Health Check: http://localhost:' + PORT + '/api/health');
      console.log('');
      console.log('🔗 Available API Endpoints:');
      console.log('   POST /api/auth/register - User registration');
      console.log('   POST /api/auth/login - User login');
      console.log('   GET  /api/products - Get all products');
      console.log('   POST /api/products - Create new product');
      console.log('   GET  /api/gamification/profile - Get user profile');
      console.log('   POST /api/gamification/track-activity - Track user activity');
      console.log('   POST /api/orders - Create new order');
      console.log('');
      console.log('🔒 Security Testing Endpoints:');
      console.log('   GET  /api/security/test-auth - Test authentication');
      console.log('   POST /api/security/test-input-validation - Test input validation');
      console.log('   GET  /api/security/test-rate-limit - Test rate limiting');
      console.log('   GET  /api/security/test-rbac - Test role-based access');
      console.log('   POST /api/security/test-file-upload - Test file upload security');
      console.log('   GET  /api/security/security-report - Get security report');
      console.log('');
      console.log('💡 Test with curl:');
      console.log('   curl -X GET http://localhost:' + PORT + '/api/health');
      console.log('   curl -X POST http://localhost:' + PORT + '/api/auth/register -H "Content-Type: application/json" -d \'{"username":"testuser","password":"password123","email":"test@example.com"}\'');
      console.log('   curl -X GET http://localhost:' + PORT + '/api/security/security-report');
      console.log('');
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));