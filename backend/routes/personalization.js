const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');

// Get personalized recommendations for a user
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user preferences
    const preferences = user.preferences;
    
    // Build query based on preferences
    let query = { approved: true };
    
    // Filter by sustainability score if user values it
    if (preferences.sustainability === 'Very Important') {
      query.sustainabilityScore = { $gte: 8 };
    } else if (preferences.sustainability === 'Somewhat Important') {
      query.sustainabilityScore = { $gte: 6 };
    }

    // Filter by materials if specified
    if (preferences.materials && preferences.materials.length > 0) {
      const materialRegex = preferences.materials.map(material => 
        new RegExp(material, 'i')
      );
      query.$or = [
        { material: { $in: materialRegex } },
        { materials: { $in: materialRegex } }
      ];
    }

    // Get products matching preferences
    let products = await Product.find(query)
      .populate('brand', 'name')
      .limit(10);

    // If not enough products, get more without strict filtering
    if (products.length < 5) {
      const additionalProducts = await Product.find({ approved: true })
        .populate('brand', 'name')
        .limit(10 - products.length);
      products = [...products, ...additionalProducts];
    }

    // Calculate match percentages and add reasoning
    const recommendations = products.map(product => {
      let matchScore = 50; // Base score
      let reasons = [];

      // Check sustainability preference
      if (preferences.sustainability === 'Very Important' && product.sustainabilityScore >= 8) {
        matchScore += 20;
        reasons.push('High sustainability score');
      }

      // Check materials preference
      if (preferences.materials && preferences.materials.length > 0) {
        const productMaterials = (product.material || '').toLowerCase();
        const hasPreferredMaterial = preferences.materials.some(material =>
          productMaterials.includes(material.toLowerCase())
        );
        if (hasPreferredMaterial) {
          matchScore += 15;
          reasons.push('Uses your preferred materials');
        }
      }

      // Check budget preference
      if (preferences.budget) {
        const price = product.price || 0;
        if (preferences.budget.includes('Budget-friendly') && price <= 50) {
          matchScore += 10;
          reasons.push('Fits your budget');
        } else if (preferences.budget.includes('Mid-range') && price > 50 && price <= 150) {
          matchScore += 10;
          reasons.push('Fits your budget');
        } else if (preferences.budget.includes('Premium') && price > 150) {
          matchScore += 10;
          reasons.push('Fits your budget');
        }
      }

      // Check style preference
      if (preferences.style) {
        const styleKeywords = {
          'Casual & Comfortable': ['casual', 'comfortable', 'relaxed'],
          'Professional & Elegant': ['professional', 'elegant', 'formal'],
          'Trendy & Fashion-forward': ['trendy', 'fashion', 'stylish'],
          'Minimalist & Sustainable': ['minimalist', 'simple', 'sustainable']
        };

        const keywords = styleKeywords[preferences.style] || [];
        const productName = (product.name || '').toLowerCase();
        const productDesc = (product.description || '').toLowerCase();
        
        const hasStyleMatch = keywords.some(keyword =>
          productName.includes(keyword) || productDesc.includes(keyword)
        );
        
        if (hasStyleMatch) {
          matchScore += 15;
          reasons.push('Matches your style preference');
        }
      }

      return {
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : null,
        sustainabilityScore: product.sustainabilityScore,
        brand: product.brand?.name,
        match: Math.min(matchScore, 100),
        reason: reasons.length > 0 ? reasons.join(', ') : 'Based on your preferences'
      };
    });

    // Sort by match score
    recommendations.sort((a, b) => b.match - a.match);

    res.json(recommendations.slice(0, 6));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's style profile and insights
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate AI insights based on user activity
    const insights = [];
    
    if (user.activity.productsViewed > 0) {
      insights.push(`You've viewed ${user.activity.productsViewed} products`);
    }
    
    if (user.activity.productsPurchased > 0) {
      insights.push(`You've made ${user.activity.productsPurchased} purchases`);
    }
    
    if (user.activity.reviewsPosted > 0) {
      insights.push(`You've written ${user.activity.reviewsPosted} reviews`);
    }

    // Add insights based on preferences
    if (user.preferences.sustainability === 'Very Important') {
      insights.push('You prioritize high sustainability scores');
    }
    
    if (user.preferences.materials && user.preferences.materials.length > 0) {
      insights.push(`You prefer ${user.preferences.materials.join(', ')} materials`);
    }

    // Add budget insights
    if (user.activity.totalSpent > 0) {
      const avgSpend = user.activity.totalSpent / user.activity.productsPurchased;
      if (avgSpend <= 50) {
        insights.push('You typically shop in the budget-friendly range');
      } else if (avgSpend <= 150) {
        insights.push('You typically shop in the mid-range');
      } else {
        insights.push('You typically shop in the premium range');
      }
    }

    res.json({
      preferences: user.preferences,
      activity: user.activity,
      insights: insights.slice(0, 5) // Limit to 5 insights
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { style, budget, sustainability, colors, materials } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update preferences
    user.preferences = {
      ...user.preferences,
      ...(style && { style }),
      ...(budget && { budget }),
      ...(sustainability && { sustainability }),
      ...(colors && { colors }),
      ...(materials && { materials })
    };

    await user.save();
    res.json({ 
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get trending products (for non-logged users or as fallback)
router.get('/trending', async (req, res) => {
  try {
    const products = await Product.find({ approved: true })
      .populate('brand', 'name')
      .sort({ views: -1, salesCount: -1 })
      .limit(6);

    const trending = products.map(product => ({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : null,
      sustainabilityScore: product.sustainabilityScore,
      brand: product.brand?.name,
      views: product.views || 0,
      salesCount: product.salesCount || 0
    }));

    res.json(trending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get community statistics
router.get('/community-stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments({ approved: true });
    const totalReviews = await User.aggregate([
      { $group: { _id: null, totalReviews: { $sum: '$activity.reviewsPosted' } } }
    ]);

    // Calculate total carbon saved
    const carbonStats = await User.aggregate([
      { $group: { _id: null, totalCarbonSaved: { $sum: '$activity.carbonSaved' } } }
    ]);

    res.json({
      totalMembers: totalUsers,
      totalProducts: totalProducts,
      totalReviews: totalReviews[0]?.totalReviews || 0,
      carbonSaved: carbonStats[0]?.totalCarbonSaved || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 