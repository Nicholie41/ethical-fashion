const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Get user's notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;

    let notifications = user.notifications || [];
    
    if (unreadOnly === 'true') {
      notifications = notifications.filter(n => !n.read);
    }

    // Sort by date (newest first)
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    const paginatedNotifications = notifications.slice(skip, skip + parseInt(limit));
    const total = notifications.length;
    const totalPages = Math.ceil(total / limit);

    res.json({
      notifications: paginatedNotifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const notification = user.notifications.id(req.params.notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = true;
    await user.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.notifications.forEach(notification => {
      notification.read = true;
    });

    await user.save();

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete notification
router.delete('/:notificationId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.notifications = user.notifications.filter(
      n => n._id.toString() !== req.params.notificationId
    );

    await user.save();

    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get notification settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Default notification settings
    const settings = user.notificationSettings || {
      email: {
        orderUpdates: true,
        promotions: true,
        gamification: true,
        sustainability: true,
        weekly: true
      },
      push: {
        orderUpdates: true,
        promotions: false,
        gamification: true,
        sustainability: true
      },
      frequency: 'immediate' // immediate, daily, weekly
    };

    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update notification settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.notificationSettings = {
      ...user.notificationSettings,
      ...req.body
    };

    await user.save();

    res.json({ 
      message: 'Notification settings updated',
      settings: user.notificationSettings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread notification count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const unreadCount = (user.notifications || []).filter(n => !n.read).length;

    res.json({ unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create notification (internal use)
const createNotification = async (userId, notificationData) => {
  try {
    const user = await User.findById(userId);
    if (!user) return false;

    const notification = {
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      date: new Date(),
      read: false,
      data: notificationData.data || {},
      priority: notificationData.priority || 'normal' // low, normal, high, urgent
    };

    user.notifications.unshift(notification); // Add to beginning

    // Keep only last 100 notifications
    if (user.notifications.length > 100) {
      user.notifications = user.notifications.slice(0, 100);
    }

    await user.save();
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};

// Notification templates
const notificationTemplates = {
  welcome: {
    type: 'welcome',
    title: 'Welcome to Ethical Fashion! 🎉',
    message: 'Thank you for joining our sustainable fashion community. Start exploring and earn your first points!',
    priority: 'high'
  },
  firstPurchase: {
    type: 'achievement',
    title: 'First Purchase Badge Earned! 🛍️',
    message: 'Congratulations! You\'ve earned the First Purchase badge and 100 points.',
    priority: 'high'
  },
  streakMilestone: {
    type: 'gamification',
    title: 'Streak Milestone Reached! 🔥',
    message: 'You\'ve maintained a {days}-day streak! Keep it up to earn more rewards.',
    priority: 'normal'
  },
  levelUp: {
    type: 'gamification',
    title: 'Level Up! 🎯',
    message: 'Congratulations! You\'ve reached {level} level. New rewards await!',
    priority: 'high'
  },
  orderShipped: {
    type: 'order',
    title: 'Order Shipped! 📦',
    message: 'Your order #{orderId} has been shipped and is on its way to you.',
    priority: 'normal'
  },
  sustainabilityMilestone: {
    type: 'sustainability',
    title: 'Environmental Impact Milestone! 🌱',
    message: 'You\'ve saved {carbonSaved}kg of CO2 through your sustainable purchases!',
    priority: 'normal'
  },
  promotion: {
    type: 'promotion',
    title: 'Special Offer Just for You! 💎',
    message: '{promotionMessage} Use code {code} for {discount}% off!',
    priority: 'normal'
  },
  backInStock: {
    type: 'product',
    title: 'Item Back in Stock! ⭐',
    message: '{productName} is back in stock and ready for purchase.',
    priority: 'normal'
  },
  reviewRequest: {
    type: 'review',
    title: 'How was your purchase? 📝',
    message: 'We\'d love to hear about your experience with {productName}. Leave a review and earn points!',
    priority: 'low'
  }
};

// Helper function to send notifications
const sendNotification = async (userId, templateKey, data = {}) => {
  const template = notificationTemplates[templateKey];
  if (!template) return false;

  let message = template.message;
  Object.keys(data).forEach(key => {
    message = message.replace(`{${key}}`, data[key]);
  });

  return await createNotification(userId, {
    type: template.type,
    title: template.title,
    message,
    priority: template.priority,
    data
  });
};

// Export for use in other modules
module.exports = {
  router,
  createNotification,
  sendNotification,
  notificationTemplates
}; 