// Import required dependencies for product management API
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');

// Authorization middleware: Check if user has admin privileges
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ error: "Admin access required" });
}

// Authorization middleware: Check if user is supplier or admin
function requireSupplierOrAdmin(req, res, next) {
  if (req.user && (req.user.role === "supplier" || req.user.role === "admin")) return next();
  return res.status(403).json({ error: "Supplier access required" });
}

// Configure multer for file uploads with custom storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Business logic: Compute sustainability score based on product attributes
function computeSustainabilityScore(product) {
  let score = 0;
  if (product.material || product.materials) {
    const mat = product.material || product.materials;
    if (mat.includes('organic')) score += 3;
  }
  if (product.laborPractices && product.laborPractices.includes('fair')) score += 2;
  if (product.certifications && product.certifications.includes('GOTS')) score += 2;
  return Math.min(score, 10);
}

// Global logging middleware for all product routes
router.use((req, res, next) => {
  console.log(`[Products Router] [${req.method}] ${req.originalUrl}`);
  next();
});

// Public API: Get list of approved products with advanced filtering and search
router.get('/', async (req, res) => {
  const { 
    q, // search query
    sortBy = 'relevance',
    minPrice,
    maxPrice,
    minSustainability,
    maxSustainability,
    category,
    brand,
    materials,
    colors,
    sizes,
    dateRange,
    approved,
    page = 1,
    limit = 20
  } = req.query;

  let filters = {};
  
  // Text search filter across product name, description, and materials
  if (q) {
    filters.$or = [
      { name: new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') },
      { material: new RegExp(q, 'i') }
    ];
  }

  // Price range filtering
  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }

  // Sustainability score filtering
  if (minSustainability || maxSustainability) {
    filters.sustainabilityScore = {};
    if (minSustainability) filters.sustainabilityScore.$gte = Number(minSustainability);
    if (maxSustainability) filters.sustainabilityScore.$lte = Number(maxSustainability);
  }

  // Category filtering
  if (category && category !== 'all') {
    filters.category = new RegExp(category, 'i');
  }

  // Brand filtering
  if (brand && brand !== 'all') {
    // First find the brand by name, then filter by brand ID
    const brandDoc = await require('../models/Brand').findOne({ name: new RegExp(brand, 'i') });
    if (brandDoc) {
      filters.brand = brandDoc._id;
    }
  }

  // Materials filter
  if (materials) {
    const materialArray = materials.split(',').map(m => m.trim());
    filters.$or = filters.$or || [];
    filters.$or.push(
      { material: { $in: materialArray.map(m => new RegExp(m, 'i')) } },
      { materials: { $in: materialArray.map(m => new RegExp(m, 'i')) } }
    );
  }

  // Colors filter
  if (colors) {
    const colorArray = colors.split(',').map(c => c.trim());
    filters.colors = { $in: colorArray.map(c => new RegExp(c, 'i')) };
  }

  // Sizes filter
  if (sizes) {
    const sizeArray = sizes.split(',').map(s => s.trim());
    filters.sizes = { $in: sizeArray.map(s => new RegExp(s, 'i')) };
  }

  // Date range filter
  if (dateRange && dateRange !== 'all') {
    const now = new Date();
    let startDate;
    
    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }
    
    if (startDate) {
      filters.createdAt = { $gte: startDate };
    }
  }

  // Approval filter
  if (approved !== undefined) {
    filters.approved = approved === "true";
  } else {
    filters.approved = true;
  }

  // Build sort object
  let sort = {};
  switch (sortBy) {
    case 'price_asc':
      sort.price = 1;
      break;
    case 'price_desc':
      sort.price = -1;
      break;
    case 'newest':
      sort.createdAt = -1;
      break;
    case 'oldest':
      sort.createdAt = 1;
      break;
    case 'popular':
      sort.views = -1;
      break;
    case 'sustainability':
      sort.sustainabilityScore = -1;
      break;
    case 'rating':
      sort.rating = -1;
      break;
    case 'relevance':
    default:
      if (q) {
        // For relevance with search query, use text score
        filters.$text = { $search: q };
        sort.score = { $meta: 'textScore' };
      } else {
        sort.views = -1; // Default to popularity
      }
      break;
  }

  try {
    // Pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    let query = Product.find(filters).populate('brand').sort(sort).skip(skip).limit(Number(limit));
    
    // If searching by text relevance, add text search
    if (q && sortBy === 'relevance') {
      query = Product.find(
        { $text: { $search: q }, ...filters },
        { score: { $meta: 'textScore' } }
      ).populate('brand').sort(sort).skip(skip).limit(Number(limit));
    }

    const products = await query;
    const total = await Product.countDocuments(filters);

      // Frontend expects `GET /api/products` with *no query params* to be an array.
      // When filters/sorting are used, keep the richer `{ products, pagination }` shape.
      const returnArray = Object.keys(req.query || {}).length === 0;
      if (returnArray) return res.json(products);

      res.json({
        products,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: Add a new product (supplier or admin required), handles multiple images and image URLs
router.post(
  '/',
  function logStep1(req, res, next) {
    console.log("[Add Product] Step 1: Entered /api/products POST route");
    next();
  },
  authenticateToken,
  function logStep2(req, res, next) {
    console.log("[Add Product] Step 2: Passed authenticateToken");
    next();
  },
  requireSupplierOrAdmin,
  function logStep3(req, res, next) {
    console.log("[Add Product] Step 3: Passed requireSupplierOrAdmin");
    next();
  },
  upload.array('images', 10), // <-- Accept multiple images
  function logStep4(req, res, next) {
    console.log("[Add Product] Step 4: Multer done. req.body:", req.body, "req.files:", req.files);
    next();
  },
  async (req, res) => {
    try {
      let p = req.body;

      // Handle multiple image files
      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        imageUrls = req.files.map(file => '/uploads/' + file.filename);
      }

      // Add image URLs from text input if provided
      if (p.imageUrls) {
        // If sent as a single string, split by comma
        let urls = [];
        if (typeof p.imageUrls === 'string') {
          try {
            // Try to parse as JSON array
            urls = JSON.parse(p.imageUrls);
            if (!Array.isArray(urls)) urls = [p.imageUrls];
          } catch {
            // Fallback: split by comma
            urls = p.imageUrls.split(',').map(u => u.trim()).filter(Boolean);
          }
        } else if (Array.isArray(p.imageUrls)) {
          urls = p.imageUrls;
        }
        imageUrls = imageUrls.concat(urls);
      }

      // Parse sizes/colors if sent as JSON strings
      let sizesArr = [];
      if (p.sizes) {
        try {
          sizesArr = JSON.parse(p.sizes);
        } catch {
          sizesArr = p.sizes.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      let colorsArr = [];
      if (p.colors) {
        try {
          colorsArr = JSON.parse(p.colors);
        } catch {
          colorsArr = p.colors.split(',').map(c => c.trim()).filter(Boolean);
        }
      }

      p.sustainabilityScore = p.sustainabilityScore
        ? Number(p.sustainabilityScore)
        : computeSustainabilityScore(p);

      // Set uploader as ObjectId, and approval based on role
      if (req.user) {
        p.uploader = req.user.id;
        p.approved = req.user.role === 'admin'; // auto-approve if admin
      }

      // LOGGING FOR DEBUGGING
      console.log("[Add Product] Step 5: In async handler. req.body:", p);

      const product = new Product({
        ...p,
        imageUrls,
        sizes: sizesArr,
        colors: colorsArr,
      });
      await product.save();
      console.log("[Add Product] Step 6: Product created successfully:", product);
      res.status(201).json(product);
    } catch (err) {
      // LOGGING FOR DEBUGGING
      console.error("[Add Product] Error:", err.message, err);
      res.status(400).json({ error: err.message });
    }
  }
);

// Supplier: Get their own products
router.get('/mine', authenticateToken, requireSupplierOrAdmin, async (req, res) => {
  try {
    const products = await Product.find({ uploader: req.user.id }).populate('brand');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Supplier Stats Dashboard Endpoint
router.get('/mine/stats', authenticateToken, requireSupplierOrAdmin, async (req, res) => {
  try {
    // Get all products uploaded by this supplier
    const products = await Product.find({ uploader: req.user.id });
    const productIds = products.map(p => p._id);
    const totalProducts = products.length;
    const approvedProducts = products.filter(p => p.approved).length;
    const pendingProducts = products.filter(p => !p.approved).length;

    // Get all orders containing this supplier's products
    const orders = await Order.find({ 'items.productId': { $in: productIds } }).sort({ createdAt: -1 });
    let totalSales = 0;
    let totalRevenue = 0;
    let recentOrders = [];
    for (const order of orders) {
      let supplierItems = order.items.filter(i => productIds.some(id => id.equals(i.productId)));
      let orderSales = supplierItems.reduce((sum, i) => sum + (i.quantity || 1), 0);
      let orderRevenue = supplierItems.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0);
      totalSales += orderSales;
      totalRevenue += orderRevenue;
      if (recentOrders.length < 5) {
        recentOrders.push({
          orderId: order._id,
          date: order.createdAt,
          items: supplierItems,
          total: orderRevenue,
          status: order.status
        });
      }
    }
    res.json({
      totalProducts,
      approvedProducts,
      pendingProducts,
      totalSales,
      totalRevenue,
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Product Analytics Endpoints ---
// Increment product views
router.post('/:id/view', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 }, $set: { lastViewedAt: new Date() } },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ views: product.views, lastViewedAt: product.lastViewedAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Increment product clicks
router.post('/:id/click', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ clicks: product.clicks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get analytics for a single product
router.get('/:id/analytics', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const { views, clicks, salesCount, lastViewedAt } = product;
    res.json({ views, clicks, salesCount, lastViewedAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get analytics for all products owned by the logged-in supplier
router.get('/mine/analytics', authenticateToken, requireSupplierOrAdmin, async (req, res) => {
  try {
    const products = await Product.find({ uploader: req.user.id }); // Changed from supplier to uploader
    const analytics = products.map(p => ({
      id: p._id,
      name: p.name,
      views: p.views,
      clicks: p.clicks,
      salesCount: p.salesCount,
      lastViewedAt: p.lastViewedAt
    }));
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get approval history for a product
router.get('/:id/approval-history', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('approvalHistory.admin', 'username email');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({
      approvalHistory: product.approvalHistory || [],
      adminFeedback: product.adminFeedback || ''
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------- ADMIN ENDPOINTS -----------

// GET all pending products (admin only)
router.get('/admin/products/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await Product.find({ approved: false }).populate('brand').populate('uploader', 'username');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT approve a product (admin only)
router.put('/admin/products/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product approved", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all notifications for the logged-in user
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.notifications || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Mark a notification as read
router.post('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const notif = (user.notifications || []).find(n => n._id && n._id.toString() === req.params.id);
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    notif.read = true;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed Products with High-Quality Data (Admin only)
router.post('/seed', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // First, get or create some brands
    const Brand = require('../models/Brand');
    
    const brands = await Promise.all([
      Brand.findOneAndUpdate(
        { name: 'PACT' },
        { 
          name: 'PACT',
          description: 'Sustainable basics made with organic cotton',
          website: 'https://wearpact.com',
          approved: true
        },
        { upsert: true, new: true }
      ),
      Brand.findOneAndUpdate(
        { name: 'Patagonia' },
        { 
          name: 'Patagonia',
          description: 'Outdoor clothing with environmental responsibility',
          website: 'https://patagonia.com',
          approved: true
        },
        { upsert: true, new: true }
      ),
      Brand.findOneAndUpdate(
        { name: 'Eileen Fisher' },
        { 
          name: 'Eileen Fisher',
          description: 'Timeless, sustainable women\'s clothing',
          website: 'https://eileenfisher.com',
          approved: true
        },
        { upsert: true, new: true }
      ),
      Brand.findOneAndUpdate(
        { name: 'Veja' },
        { 
          name: 'Veja',
          description: 'Sustainable sneakers made with organic materials',
          website: 'https://veja-store.com',
          approved: true
        },
        { upsert: true, new: true }
      ),
      Brand.findOneAndUpdate(
        { name: 'Reformation' },
        { 
          name: 'Reformation',
          description: 'Sustainable fashion for the modern woman',
          website: 'https://reformation.com',
          approved: true
        },
        { upsert: true, new: true }
      )
    ]);

    const premiumProducts = [
      {
        name: "Organic Cotton Crew Neck Sweatshirt",
        description: "Made with 100% organic cotton, this ultra-soft crew neck sweatshirt features a relaxed fit and ribbed cuffs and hem. Perfect for everyday wear, it's breathable, comfortable, and sustainably produced without harmful chemicals.",
        price: 45.00,
        material: "Organic Cotton",
        materials: ["Organic Cotton"],
        category: "Sweatshirts",
        sustainabilityScore: 9,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        colors: ["Heather Gray", "Navy", "Black", "White"],
        imageUrls: [
          "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1000&fit=crop"
        ],
        brand: brands[0]._id, // PACT
        approved: true,
        uploader: req.user.id,
        views: 1250,
        rating: 4.8
      },
      {
        name: "Hemp Canvas Tote Bag",
        description: "This durable tote bag is crafted from premium hemp canvas, featuring reinforced handles and a spacious interior. Hemp is naturally antimicrobial and requires minimal water to grow, making this bag both stylish and eco-friendly.",
        price: 35.00,
        material: "Hemp",
        materials: ["Hemp", "Organic Cotton"],
        category: "Bags",
        sustainabilityScore: 10,
        sizes: ["One Size"],
        colors: ["Natural", "Black", "Olive"],
        imageUrls: [
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=1000&fit=crop"
        ],
        brand: brands[1]._id, // Patagonia
        approved: true,
        uploader: req.user.id,
        views: 890,
        rating: 4.9
      },
      {
        name: "Bamboo Viscose Blouse",
        description: "This elegant blouse is made from bamboo viscose, a silky-soft fabric that's naturally antibacterial and moisture-wicking. The relaxed fit and button-down design make it perfect for both casual and professional settings.",
        price: 65.00,
        material: "Bamboo Viscose",
        materials: ["Bamboo Viscose"],
        category: "Blouses",
        sustainabilityScore: 8,
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["White", "Light Blue", "Pink", "Black"],
        imageUrls: [
          "https://images.unsplash.com/photo-1564257631407-3deb25e9c8e0?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1000&fit=crop"
        ],
        brand: brands[2]._id, // Eileen Fisher
        approved: true,
        uploader: req.user.id,
        views: 1100,
        rating: 4.7
      },
      {
        name: "Recycled Polyester Active Leggings",
        description: "These high-performance leggings are made from recycled polyester, diverting plastic waste from landfills. They feature a high-waisted design, four-way stretch, and moisture-wicking technology for ultimate comfort during workouts.",
        price: 55.00,
        material: "Recycled Polyester",
        materials: ["Recycled Polyester", "Elastane"],
        category: "Activewear",
        sustainabilityScore: 7,
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Black", "Navy", "Charcoal", "Burgundy"],
        imageUrls: [
          "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=1000&fit=crop"
        ],
        brand: brands[3]._id, // Veja
        approved: true,
        uploader: req.user.id,
        views: 1450,
        rating: 4.6
      },
      {
        name: "Tencel Linen Blend Dress",
        description: "This flowy midi dress combines the softness of Tencel with the breathability of linen. The relaxed silhouette and adjustable waist tie create a flattering fit, while the sustainable fabric blend ensures comfort in any weather.",
        price: 85.00,
        material: "Tencel Linen Blend",
        materials: ["Tencel", "Linen"],
        category: "Dresses",
        sustainabilityScore: 9,
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Sage Green", "Terracotta", "Navy", "Cream"],
        imageUrls: [
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1000&fit=crop"
        ],
        brand: brands[4]._id, // Reformation
        approved: true,
        uploader: req.user.id,
        views: 980,
        rating: 4.9
      },
      {
        name: "Organic Wool Sweater",
        description: "This cozy sweater is crafted from organic wool, providing natural warmth and breathability. The classic crew neck design and ribbed texture make it a timeless addition to any wardrobe, while the organic certification ensures ethical production.",
        price: 95.00,
        material: "Organic Wool",
        materials: ["Organic Wool"],
        category: "Sweaters",
        sustainabilityScore: 8,
        sizes: ["S", "M", "L", "XL"],
        colors: ["Camel", "Charcoal", "Navy", "Cream"],
        imageUrls: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=1000&fit=crop"
        ],
        brand: brands[2]._id, // Eileen Fisher
        approved: true,
        uploader: req.user.id,
        views: 1200,
        rating: 4.8
      },
      {
        name: "Hemp Denim Jeans",
        description: "These classic straight-leg jeans are made from a blend of hemp and organic cotton, creating a durable yet comfortable fabric. Hemp requires less water and pesticides than conventional cotton, making these jeans both stylish and sustainable.",
        price: 75.00,
        material: "Hemp Denim",
        materials: ["Hemp", "Organic Cotton"],
        category: "Jeans",
        sustainabilityScore: 9,
        sizes: ["28", "30", "32", "34", "36"],
        colors: ["Medium Wash", "Dark Wash", "Black"],
        imageUrls: [
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=1000&fit=crop"
        ],
        brand: brands[1]._id, // Patagonia
        approved: true,
        uploader: req.user.id,
        views: 1350,
        rating: 4.7
      },
      {
        name: "Bamboo Socks Set",
        description: "This set of three pairs of socks is made from bamboo fiber, which is naturally antibacterial and moisture-wicking. The soft, breathable fabric keeps feet comfortable and fresh throughout the day, while the sustainable material reduces environmental impact.",
        price: 18.00,
        material: "Bamboo",
        materials: ["Bamboo", "Elastane"],
        category: "Socks",
        sustainabilityScore: 8,
        sizes: ["S", "M", "L"],
        colors: ["Gray", "Black", "Navy"],
        imageUrls: [
          "https://images.unsplash.com/photo-1586350977771-b3d0ae9c7187?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1586350977771-b3d0ae9c7187?w=800&h=1000&fit=crop"
        ],
        brand: brands[0]._id, // PACT
        approved: true,
        uploader: req.user.id,
        views: 650,
        rating: 4.5
      },
      {
        name: "Recycled Nylon Backpack",
        description: "This versatile backpack is crafted from recycled nylon, giving new life to post-consumer waste. It features multiple compartments, padded laptop sleeve, and water-resistant construction, making it perfect for work, travel, or everyday use.",
        price: 65.00,
        material: "Recycled Nylon",
        materials: ["Recycled Nylon"],
        category: "Bags",
        sustainabilityScore: 7,
        sizes: ["One Size"],
        colors: ["Black", "Navy", "Olive"],
        imageUrls: [
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop"
        ],
        brand: brands[1]._id, // Patagonia
        approved: true,
        uploader: req.user.id,
        views: 890,
        rating: 4.6
      },
      {
        name: "Silk Blouse",
        description: "This elegant silk blouse features a classic button-down design with a relaxed fit. Made from 100% mulberry silk, it's naturally temperature-regulating and hypoallergenic. The timeless style makes it perfect for professional settings or special occasions.",
        price: 120.00,
        material: "Silk",
        materials: ["Silk"],
        category: "Blouses",
        sustainabilityScore: 6,
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["White", "Black", "Navy", "Blush"],
        imageUrls: [
          "https://images.unsplash.com/photo-1564257631407-3deb25e9c8e0?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1000&fit=crop"
        ],
        brand: brands[2]._id, // Eileen Fisher
        approved: true,
        uploader: req.user.id,
        views: 1100,
        rating: 4.9
      },
      {
        name: "Linen Pants",
        description: "These comfortable linen pants feature a relaxed fit and drawstring waist for easy styling. Made from 100% European flax linen, they're naturally breathable and get softer with each wash. Perfect for warm weather and casual occasions.",
        price: 55.00,
        material: "Linen",
        materials: ["Linen"],
        category: "Pants",
        sustainabilityScore: 8,
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Natural", "White", "Navy", "Olive"],
        imageUrls: [
          "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=1000&fit=crop"
        ],
        brand: brands[4]._id, // Reformation
        approved: true,
        uploader: req.user.id,
        views: 950,
        rating: 4.7
      },
      {
        name: "Organic Cotton T-Shirt",
        description: "This classic crew neck t-shirt is made from 100% organic cotton, grown without harmful pesticides or synthetic fertilizers. The soft, breathable fabric and relaxed fit make it perfect for everyday wear, while the sustainable production supports environmental health.",
        price: 25.00,
        material: "Organic Cotton",
        materials: ["Organic Cotton"],
        category: "T-Shirts",
        sustainabilityScore: 9,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        colors: ["White", "Black", "Gray", "Navy", "Olive"],
        imageUrls: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=1000&fit=crop"
        ],
        brand: brands[0]._id, // PACT
        approved: true,
        uploader: req.user.id,
        views: 1800,
        rating: 4.8
      }
    ];

    // Create products
    const createdProducts = [];
    for (const productData of premiumProducts) {
      const product = new Product(productData);
      await product.save();
      createdProducts.push(product);
    }

    res.json({ 
      message: `Successfully seeded ${createdProducts.length} premium products`,
      products: createdProducts 
    });
  } catch (err) {
    console.error('Error seeding products:', err);
    res.status(500).json({ error: err.message });
  }
});

// Cleanup Seeded Products and Brands (Admin only)
router.delete('/cleanup', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const Brand = require('../models/Brand');
    
    // List of seeded brand names to remove
    const seededBrandNames = [
      'PACT',
      'Patagonia', 
      'Eileen Fisher',
      'Veja',
      'Reformation'
    ];

    // Find and delete seeded brands
    const deletedBrands = await Brand.deleteMany({
      name: { $in: seededBrandNames }
    });

    // Find and delete products from seeded brands
    const seededBrands = await Brand.find({
      name: { $in: seededBrandNames }
    });
    
    const seededBrandIds = seededBrands.map(brand => brand._id);
    const deletedProducts = await Product.deleteMany({
      brand: { $in: seededBrandIds }
    });

    // Also delete products with specific names that were seeded
    const seededProductNames = [
      "Organic Cotton Crew Neck Sweatshirt",
      "Hemp Canvas Tote Bag", 
      "Recycled Nylon Backpack",
      "Silk Blouse",
      "Linen Pants",
      "Organic Cotton T-Shirt"
    ];

    const additionalDeletedProducts = await Product.deleteMany({
      name: { $in: seededProductNames }
    });

    const totalDeletedProducts = deletedProducts.deletedCount + additionalDeletedProducts.deletedCount;

    res.json({
      message: `Cleanup completed successfully`,
      deletedBrands: deletedBrands.deletedCount,
      deletedProducts: totalDeletedProducts,
      details: {
        brandsRemoved: seededBrandNames,
        productsRemoved: seededProductNames
      }
    });

  } catch (err) {
    console.error('Error during cleanup:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;