const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Get user's gamification profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('points level badges achievements streak preferences activity');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user preferences (from quiz or manual update)
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { style, budget, sustainability, colors, materials, quizCompleted } = req.body;
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
      ...(materials && { materials }),
      ...(quizCompleted !== undefined && { quizCompleted })
    };

    // Award points for completing quiz
    if (quizCompleted && !user.preferences.quizCompleted) {
      user.points += 50;
      user.achievements.push({
        id: 'quiz-completed',
        name: 'Style Explorer',
        icon: '🎯',
        description: 'Completed the style preference quiz',
        points: 50
      });
    }

    await user.save();
    res.json({ 
      message: 'Preferences updated successfully',
      user: {
        points: user.points,
        preferences: user.preferences,
        achievements: user.achievements
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Award points for various activities
router.post('/award-points', authenticateToken, async (req, res) => {
  try {
    const { activity, points, badgeId, achievementId } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Award points
    if (points) {
      user.points += points;
    }

    // Award badge if specified
    if (badgeId) {
      const badgeExists = user.badges.find(b => b.id === badgeId);
      if (!badgeExists) {
        const badgeMap = {
          'first-purchase': { name: 'First Purchase', icon: '🛍️', description: 'Complete your first order' },
          'eco-warrior': { name: 'Eco Warrior', icon: '🌱', description: 'Buy 5 sustainable products' },
          'streak-master': { name: 'Streak Master', icon: '🔥', description: 'Visit for 7 days in a row' },
          'reviewer': { name: 'Top Reviewer', icon: '⭐', description: 'Write 10 product reviews' },
          'community': { name: 'Community Hero', icon: '💬', description: 'Help 5 other members' },
          'vip': { name: 'VIP Member', icon: '👑', description: 'Reach 1000 points' }
        };

        const badge = badgeMap[badgeId];
        if (badge) {
          user.badges.push({
            id: badgeId,
            name: badge.name,
            icon: badge.icon,
            description: badge.description
          });
        }
      }
    }

    // Award achievement if specified
    if (achievementId) {
      const achievementExists = user.achievements.find(a => a.id === achievementId);
      if (!achievementExists) {
        const achievementMap = {
          'welcome': { name: 'Welcome Bonus', icon: '🎉', description: 'Join our community', points: 50 },
          'explorer': { name: 'Explorer', icon: '🔍', description: 'Browse 20 products', points: 25 },
          'collector': { name: 'Collector', icon: '📦', description: 'Add 10 items to wishlist', points: 75 },
          'savvy': { name: 'Savvy Shopper', icon: '💰', description: 'Save $50 on purchases', points: 200 }
        };

        const achievement = achievementMap[achievementId];
        if (achievement) {
          user.achievements.push({
            id: achievementId,
            name: achievement.name,
            icon: achievement.icon,
            description: achievement.description,
            points: achievement.points
          });
          user.points += achievement.points;
        }
      }
    }

    // Update level based on points
    const newLevel = calculateLevel(user.points);
    if (newLevel !== user.level) {
      user.level = newLevel;
    }

    await user.save();
    res.json({ 
      message: 'Points awarded successfully',
      user: {
        points: user.points,
        level: user.level,
        badges: user.badges,
        achievements: user.achievements
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update streak (called on each visit)
router.post('/update-streak', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const now = new Date();
    const lastVisit = user.streak.lastVisit ? new Date(user.streak.lastVisit) : null;
    
    if (!lastVisit) {
      // First visit
      user.streak.current = 1;
      user.streak.lastVisit = now;
    } else {
      const daysDiff = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        user.streak.current += 1;
        user.streak.lastVisit = now;
        
        // Award points for daily streak
        user.points += 10;
        
        // Check for streak achievements
        if (user.streak.current === 7 && !user.badges.find(b => b.id === 'streak-master')) {
          user.badges.push({
            id: 'streak-master',
            name: 'Streak Master',
            icon: '🔥',
            description: 'Visit for 7 days in a row'
          });
          user.points += 500;
        }
      } else if (daysDiff > 1) {
        // Streak broken
        user.streak.current = 1;
        user.streak.lastVisit = now;
      }
    }

    // Update longest streak
    if (user.streak.current > user.streak.longest) {
      user.streak.longest = user.streak.current;
    }

    await user.save();
    res.json({ 
      message: 'Streak updated successfully',
      streak: user.streak,
      points: user.points
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Track activity (product views, purchases, etc.)
router.post('/track-activity', authenticateToken, async (req, res) => {
  try {
    const { activity, data } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    switch (activity) {
      case 'product_view':
        user.activity.productsViewed += 1;
        if (user.activity.productsViewed === 20) {
          // Award Explorer achievement
          const achievementExists = user.achievements.find(a => a.id === 'explorer');
          if (!achievementExists) {
            user.achievements.push({
              id: 'explorer',
              name: 'Explorer',
              icon: '🔍',
              description: 'Browse 20 products',
              points: 25
            });
            user.points += 25;
          }
        }
        break;
        
      case 'purchase':
        user.activity.productsPurchased += 1;
        user.activity.totalSpent += data.amount || 0;
        user.activity.lastPurchase = new Date();
        user.activity.carbonSaved += data.carbonSaved || 0;
        
        if (user.activity.productsPurchased === 1) {
          // Award First Purchase badge
          const badgeExists = user.badges.find(b => b.id === 'first-purchase');
          if (!badgeExists) {
            user.badges.push({
              id: 'first-purchase',
              name: 'First Purchase',
              icon: '🛍️',
              description: 'Complete your first order'
            });
            user.points += 100;
          }
        }
        
        if (user.activity.productsPurchased === 5) {
          // Award Eco Warrior badge
          const ecoBadgeExists = user.badges.find(b => b.id === 'eco-warrior');
          if (!ecoBadgeExists) {
            user.badges.push({
              id: 'eco-warrior',
              name: 'Eco Warrior',
              icon: '🌱',
              description: 'Buy 5 sustainable products'
            });
            user.points += 250;
          }
        }
        break;
        
      case 'review':
        user.activity.reviewsPosted += 1;
        if (user.activity.reviewsPosted === 10) {
          // Award Top Reviewer badge
          const reviewerBadgeExists = user.badges.find(b => b.id === 'reviewer');
          if (!reviewerBadgeExists) {
            user.badges.push({
              id: 'reviewer',
              name: 'Top Reviewer',
              icon: '⭐',
              description: 'Write 10 product reviews'
            });
            user.points += 300;
          }
        }
        break;
    }

    // Update level
    const newLevel = calculateLevel(user.points);
    if (newLevel !== user.level) {
      user.level = newLevel;
    }

    await user.save();
    res.json({ 
      message: 'Activity tracked successfully',
      activity: user.activity,
      points: user.points,
      level: user.level
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find()
      .select('username points level badges')
      .sort({ points: -1 })
      .limit(10);
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper function to calculate level based on points
function calculateLevel(points) {
  if (points >= 1000) return 'VIP';
  if (points >= 500) return 'Gold';
  if (points >= 200) return 'Silver';
  if (points >= 50) return 'Bronze';
  return 'New';
}

module.exports = router; 