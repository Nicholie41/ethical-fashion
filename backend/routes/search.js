const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Advanced product search with filters
router.get('/products', async (req, res) => {
  try {
    const {
      q = '', // search query
      category,
      brand,
      minPrice,
      maxPrice,
      minSustainability,
      maxSustainability,
      materials,
      colors,
      sizes,
      sortBy = 'relevance', // relevance, price_asc, price_desc, sustainability, newest, popular
      page = 1,
      limit = 20,
      approved = true
    } = req.query;

    // Build search query
    let query = { approved: approved === 'true' };

    // Text search
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { material: { $regex: q, $options: 'i' } },
        { materials: { $regex: q, $options: 'i' } }
      ];
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Sustainability score filter
    if (minSustainability || maxSustainability) {
      query.sustainabilityScore = {};
      if (minSustainability) query.sustainabilityScore.$gte = parseFloat(minSustainability);
      if (maxSustainability) query.sustainabilityScore.$lte = parseFloat(maxSustainability);
    }

    // Brand filter
    if (brand) {
      const brandDoc = await Brand.findOne({ name: { $regex: brand, $options: 'i' } });
      if (brandDoc) {
        query.brand = brandDoc._id;
      }
    }

    // Materials filter
    if (materials) {
      const materialArray = materials.split(',').map(m => m.trim());
      query.$or = query.$or || [];
      query.$or.push(
        { material: { $in: materialArray.map(m => new RegExp(m, 'i')) } },
        { materials: { $in: materialArray.map(m => new RegExp(m, 'i')) } }
      );
    }

    // Colors filter
    if (colors) {
      const colorArray = colors.split(',').map(c => c.trim());
      query.colors = { $in: colorArray.map(c => new RegExp(c, 'i')) };
    }

    // Sizes filter
    if (sizes) {
      const sizeArray = sizes.split(',').map(s => s.trim());
      query.sizes = { $in: sizeArray.map(s => new RegExp(s, 'i')) };
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
      case 'sustainability':
        sort.sustainabilityScore = -1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'popular':
        sort.views = -1;
        break;
      case 'relevance':
      default:
        // For relevance, we'll use text score if there's a search query
        if (q) {
          sort.score = { $meta: 'textScore' };
        } else {
          sort.views = -1; // Default to popularity
        }
        break;
    }

    // Execute search with pagination
    const skip = (page - 1) * limit;
    
    let searchQuery = Product.find(query)
      .populate('brand', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // If searching by text relevance, add text search
    if (q && sortBy === 'relevance') {
      searchQuery = Product.find(
        { $text: { $search: q }, ...query },
        { score: { $meta: 'textScore' } }
      )
      .populate('brand', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    }

    const products = await searchQuery;
    const total = await Product.countDocuments(query);

    // Get facets for filtering
    const facets = await getProductFacets(query);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      facets
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get search suggestions/autocomplete
router.get('/suggestions', async (req, res) => {
  try {
    const { q = '', type = 'products' } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    let suggestions = [];

    if (type === 'products' || type === 'all') {
      const productSuggestions = await Product.find({
        name: { $regex: q, $options: 'i' },
        approved: true
      })
      .select('name brand')
      .populate('brand', 'name')
      .limit(5);

      suggestions.push(...productSuggestions.map(p => ({
        type: 'product',
        text: p.name,
        brand: p.brand?.name,
        id: p._id
      })));
    }

    if (type === 'brands' || type === 'all') {
      const brandSuggestions = await Brand.find({
        name: { $regex: q, $options: 'i' },
        approved: true
      })
      .select('name')
      .limit(3);

      suggestions.push(...brandSuggestions.map(b => ({
        type: 'brand',
        text: b.name,
        id: b._id
      })));
    }

    if (type === 'materials' || type === 'all') {
      const materialSuggestions = await Product.distinct('material', {
        material: { $regex: q, $options: 'i' },
        approved: true
      }).limit(3);

      suggestions.push(...materialSuggestions.map(m => ({
        type: 'material',
        text: m
      })));
    }

    res.json({ suggestions: suggestions.slice(0, 8) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get search facets for filtering
router.get('/facets', async (req, res) => {
  try {
    const facets = await getProductFacets({ approved: true });
    res.json(facets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Personalized search (for logged-in users)
router.get('/personalized', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { q = '', limit = 10 } = req.query;

    // Get user preferences
    const preferences = user.preferences || {};
    const activity = user.activity || {};

    // Build personalized query
    let query = { approved: true };
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    // Add preference-based filters
    if (preferences.sustainability === 'Very Important') {
      query.sustainabilityScore = { $gte: 8 };
    } else if (preferences.sustainability === 'Somewhat Important') {
      query.sustainabilityScore = { $gte: 6 };
    }

    if (preferences.materials && preferences.materials.length > 0) {
      const materialRegex = preferences.materials.map(material => 
        new RegExp(material, 'i')
      );
      query.$or = query.$or || [];
      query.$or.push(
        { material: { $in: materialRegex } },
        { materials: { $in: materialRegex } }
      );
    }

    // Get products
    let products = await Product.find(query)
      .populate('brand', 'name')
      .limit(parseInt(limit));

    // Calculate personalization scores
    products = products.map(product => {
      let score = 0;
      let reasons = [];

      // Sustainability preference
      if (preferences.sustainability === 'Very Important' && product.sustainabilityScore >= 8) {
        score += 30;
        reasons.push('High sustainability score');
      }

      // Material preference
      if (preferences.materials && preferences.materials.length > 0) {
        const productMaterials = (product.material || '').toLowerCase();
        const hasPreferredMaterial = preferences.materials.some(material =>
          productMaterials.includes(material.toLowerCase())
        );
        if (hasPreferredMaterial) {
          score += 20;
          reasons.push('Uses your preferred materials');
        }
      }

      // Budget preference
      if (preferences.budget) {
        const price = product.price || 0;
        if (preferences.budget.includes('Budget-friendly') && price <= 50) {
          score += 15;
        } else if (preferences.budget.includes('Mid-range') && price > 50 && price <= 150) {
          score += 15;
        } else if (preferences.budget.includes('Premium') && price > 150) {
          score += 15;
        }
        if (score > 0) reasons.push('Fits your budget');
      }

      // Popularity boost
      if (product.views > 100) score += 10;
      if (product.salesCount > 10) score += 15;

      return {
        ...product.toObject(),
        personalizationScore: score,
        reasons
      };
    });

    // Sort by personalization score
    products.sort((a, b) => b.personalizationScore - a.personalizationScore);

    res.json({ products: products.slice(0, parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search analytics (track search queries)
router.post('/track', authenticateToken, async (req, res) => {
  try {
    const { query, filters, resultsCount, clickedProduct } = req.body;
    
    // Store search analytics (you could create a separate SearchAnalytics model)
    console.log('Search tracked:', {
      userId: req.user.id,
      query,
      filters,
      resultsCount,
      clickedProduct,
      timestamp: new Date()
    });

    res.json({ message: 'Search tracked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper function to get product facets
async function getProductFacets(baseQuery = {}) {
  try {
    const [priceRanges, sustainabilityRanges, materials, colors, sizes, brands] = await Promise.all([
      // Price ranges
      Product.aggregate([
        { $match: baseQuery },
        {
          $bucket: {
            groupBy: '$price',
            boundaries: [0, 25, 50, 100, 200, 500],
            default: '500+',
            output: { count: { $sum: 1 } }
          }
        }
      ]),

      // Sustainability score ranges
      Product.aggregate([
        { $match: baseQuery },
        {
          $bucket: {
            groupBy: '$sustainabilityScore',
            boundaries: [0, 3, 6, 8, 10],
            default: 'Unknown',
            output: { count: { $sum: 1 } }
          }
        }
      ]),

      // Materials
      Product.aggregate([
        { $match: baseQuery },
        { $unwind: '$materials' },
        {
          $group: {
            _id: '$materials',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Colors
      Product.aggregate([
        { $match: baseQuery },
        { $unwind: '$colors' },
        {
          $group: {
            _id: '$colors',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Sizes
      Product.aggregate([
        { $match: baseQuery },
        { $unwind: '$sizes' },
        {
          $group: {
            _id: '$sizes',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Brands
      Product.aggregate([
        { $match: baseQuery },
        {
          $lookup: {
            from: 'brands',
            localField: 'brand',
            foreignField: '_id',
            as: 'brandInfo'
          }
        },
        { $unwind: '$brandInfo' },
        {
          $group: {
            _id: '$brandInfo.name',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    return {
      priceRanges,
      sustainabilityRanges,
      materials,
      colors,
      sizes,
      brands
    };
  } catch (error) {
    console.error('Error getting facets:', error);
    return {
      priceRanges: [],
      sustainabilityRanges: [],
      materials: [],
      colors: [],
      sizes: [],
      brands: []
    };
  }
}

module.exports = router; 