const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get platform overview analytics (Admin only)
router.get('/overview', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // User metrics
    const totalUsers = await User.countDocuments();
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: lastMonth } });
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: lastWeek } });
    const activeUsers = await User.countDocuments({ 'streak.lastVisit': { $gte: lastWeek } });

    // Product metrics
    const totalProducts = await Product.countDocuments({ approved: true });
    const pendingProducts = await Product.countDocuments({ approved: false });
    const totalViews = await Product.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);

    // Sales metrics
    const totalOrders = await Order.countDocuments();
    const ordersThisMonth = await Order.countDocuments({ createdAt: { $gte: lastMonth } });
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const revenueThisMonth = await Order.aggregate([
      { $match: { createdAt: { $gte: lastMonth } } },
      { $group: { _id: null, revenue: { $sum: '$total' } } }
    ]);

    // Gamification metrics
    const totalPointsAwarded = await User.aggregate([
      { $group: { _id: null, totalPoints: { $sum: '$points' } } }
    ]);
    const totalBadgesEarned = await User.aggregate([
      { $unwind: '$badges' },
      { $group: { _id: null, totalBadges: { $sum: 1 } } }
    ]);

    // Environmental impact
    const totalCarbonSaved = await User.aggregate([
      { $group: { _id: null, carbonSaved: { $sum: '$activity.carbonSaved' } } }
    ]);

    res.json({
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        newThisWeek: newUsersThisWeek,
        active: activeUsers,
        growthRate: totalUsers > 0 ? ((newUsersThisMonth / totalUsers) * 100).toFixed(2) : 0
      },
      products: {
        total: totalProducts,
        pending: pendingProducts,
        totalViews: totalViews[0]?.totalViews || 0
      },
      sales: {
        totalOrders,
        ordersThisMonth,
        totalRevenue: totalRevenue[0]?.totalRevenue || 0,
        revenueThisMonth: revenueThisMonth[0]?.revenue || 0,
        avgOrderValue: totalOrders > 0 ? (totalRevenue[0]?.totalRevenue / totalOrders).toFixed(2) : 0
      },
      gamification: {
        totalPoints: totalPointsAwarded[0]?.totalPoints || 0,
        totalBadges: totalBadgesEarned[0]?.totalBadges || 0
      },
      impact: {
        carbonSaved: totalCarbonSaved[0]?.carbonSaved || 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user behavior analytics
router.get('/user-behavior', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // User engagement metrics
    const userEngagement = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          newUsers: { $sum: 1 },
          avgPoints: { $avg: '$points' },
          avgStreak: { $avg: '$streak.current' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Product interaction metrics
    const productInteractions = await Product.aggregate([
      { $match: { approved: true } },
      {
        $group: {
          _id: null,
          avgViews: { $avg: '$views' },
          avgClicks: { $avg: '$clicks' },
          avgSales: { $avg: '$salesCount' },
          totalViews: { $sum: '$views' },
          totalClicks: { $sum: '$clicks' },
          totalSales: { $sum: '$salesCount' }
        }
      }
    ]);

    // Conversion funnel
    const conversionData = await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          usersWithOrders: { $sum: { $cond: [{ $gt: [{ $size: '$orders' }, 0] }, 1, 0] } },
          avgOrdersPerUser: { $avg: { $size: '$orders' } }
        }
      }
    ]);

    res.json({
      userEngagement,
      productInteractions: productInteractions[0] || {},
      conversion: conversionData[0] || {}
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sustainability impact analytics
router.get('/sustainability', authenticateToken, async (req, res) => {
  try {
    // Individual user impact (for authenticated users)
    if (req.user.role === 'customer') {
      const user = await User.findById(req.user.id);
      const userOrders = await Order.find({ user: req.user.id });
      
      const userImpact = {
        carbonSaved: user.activity.carbonSaved || 0,
        sustainableProducts: user.activity.productsPurchased || 0,
        totalSpent: user.activity.totalSpent || 0,
        avgSustainabilityScore: userOrders.length > 0 ? 
          userOrders.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum, item) => {
              return itemSum + (item.sustainabilityScore || 5);
            }, 0);
          }, 0) / userOrders.reduce((sum, order) => sum + order.items.length, 0) : 0
      };

      return res.json({ userImpact });
    }

    // Platform-wide impact (for admins)
    if (req.user.role === 'admin') {
      const totalCarbonSaved = await User.aggregate([
        { $group: { _id: null, carbonSaved: { $sum: '$activity.carbonSaved' } } }
      ]);

      const sustainabilityScores = await Product.aggregate([
        { $match: { approved: true } },
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$sustainabilityScore' },
            highScore: { $sum: { $cond: [{ $gte: ['$sustainabilityScore', 8] }, 1, 0] } },
            mediumScore: { $sum: { $cond: [{ $and: [{ $gte: ['$sustainabilityScore', 6] }, { $lt: ['$sustainabilityScore', 8] }] }, 1, 0] } },
            lowScore: { $sum: { $cond: [{ $lt: ['$sustainabilityScore', 6] }, 1, 0] } }
          }
        }
      ]);

      const materialBreakdown = await Product.aggregate([
        { $match: { approved: true } },
        { $unwind: '$materials' },
        {
          $group: {
            _id: '$materials',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({
        platformImpact: {
          totalCarbonSaved: totalCarbonSaved[0]?.carbonSaved || 0,
          sustainabilityScores: sustainabilityScores[0] || {},
          materialBreakdown
        }
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get gamification analytics
router.get('/gamification', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    // Badge distribution
    const badgeDistribution = await User.aggregate([
      { $unwind: '$badges' },
      {
        $group: {
          _id: '$badges.id',
          count: { $sum: 1 },
          name: { $first: '$badges.name' },
          icon: { $first: '$badges.icon' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Level distribution
    const levelDistribution = await User.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
          avgPoints: { $avg: '$points' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Achievement completion rates
    const achievementStats = await User.aggregate([
      { $unwind: '$achievements' },
      {
        $group: {
          _id: '$achievements.id',
          count: { $sum: 1 },
          name: { $first: '$achievements.name' },
          points: { $first: '$achievements.points' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Streak statistics
    const streakStats = await User.aggregate([
      {
        $group: {
          _id: null,
          avgCurrentStreak: { $avg: '$streak.current' },
          avgLongestStreak: { $avg: '$streak.longest' },
          maxStreak: { $max: '$streak.longest' },
          activeStreaks: { $sum: { $cond: [{ $gt: ['$streak.current', 0] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      badgeDistribution,
      levelDistribution,
      achievementStats,
      streakStats: streakStats[0] || {}
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get real-time metrics
router.get('/realtime', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Recent activity
    const recentUsers = await User.countDocuments({ createdAt: { $gte: last24Hours } });
    const recentOrders = await Order.countDocuments({ createdAt: { $gte: last24Hours } });
    const recentLogins = await User.countDocuments({ 'loginActivity.date': { $gte: lastHour } });

    // Active sessions (users with recent login activity)
    const activeSessions = await User.countDocuments({
      'loginActivity.date': { $gte: lastHour }
    });

    // Recent gamification activity
    const recentPointsAwarded = await User.aggregate([
      { $match: { 'achievements.unlockedAt': { $gte: last24Hours } } },
      { $unwind: '$achievements' },
      { $match: { 'achievements.unlockedAt': { $gte: last24Hours } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    res.json({
      last24Hours: {
        newUsers: recentUsers,
        newOrders: recentOrders,
        newLogins: recentLogins
      },
      lastHour: {
        activeSessions,
        recentLogins
      },
      gamification: {
        recentAchievements: recentPointsAwarded[0]?.count || 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 