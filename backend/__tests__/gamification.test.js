const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const bcrypt = require('bcrypt');

describe('Gamification API', () => {
  let testUser, userToken;

  beforeEach(async () => {
    // Create test user with gamification data
    const userData = testUtils.createTestUser();
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    testUser = new User({
      ...userData,
      passwordHash,
      points: 150,
      level: 'Bronze',
      achievements: [
        {
          id: 'welcome',
          name: 'Welcome Bonus',
          icon: '🎉',
          description: 'Join our community',
          points: 50,
          unlockedAt: new Date()
        },
        {
          id: 'first_purchase',
          name: 'First Purchase',
          icon: '🛍️',
          description: 'Make your first purchase',
          points: 25,
          unlockedAt: new Date()
        }
      ],
      badges: [
        {
          id: 'eco_warrior',
          name: 'Eco Warrior',
          icon: '🌱',
          description: 'Purchase 5 sustainable products',
          earnedAt: new Date()
        }
      ],
      streak: {
        current: 3,
        longest: 5,
        lastVisit: new Date()
      }
    });
    await testUser.save();

    userToken = testUtils.generateTestToken({
      id: testUser._id,
      username: testUser.username,
      role: testUser.role
    });
  });

  describe('GET /api/gamification/profile', () => {
    it('should return user gamification profile', async () => {
      const response = await request(app)
        .get('/api/gamification/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('points');
      expect(response.body).toHaveProperty('level');
      expect(response.body).toHaveProperty('achievements');
      expect(response.body).toHaveProperty('badges');
      expect(response.body).toHaveProperty('streak');
      
      expect(response.body.points).toBe(150);
      expect(response.body.level).toBe('Bronze');
      expect(response.body.achievements).toHaveLength(2);
      expect(response.body.badges).toHaveLength(1);
      expect(response.body.streak.current).toBe(3);
    });

    it('should reject access without authentication', async () => {
      await request(app)
        .get('/api/gamification/profile')
        .expect(401);
    });
  });

  describe('PUT /api/gamification/preferences', () => {
    it('should update user gamification preferences', async () => {
      const preferences = {
        notifications: true,
        publicProfile: false,
        showPoints: true
      };

      const response = await request(app)
        .put('/api/gamification/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send(preferences)
        .expect(200);

      expect(response.body.message).toBe('Preferences updated successfully');
    });

    it('should validate preference data', async () => {
      const invalidPreferences = {
        notifications: 'invalid',
        publicProfile: 'not_boolean'
      };

      await request(app)
        .put('/api/gamification/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidPreferences)
        .expect(400);
    });
  });

  describe('POST /api/gamification/award-points', () => {
    it('should award points to user', async () => {
      const awardData = {
        points: 25,
        reason: 'Product review',
        badgeId: 'reviewer'
      };

      const response = await request(app)
        .post('/api/gamification/award-points')
        .set('Authorization', `Bearer ${userToken}`)
        .send(awardData)
        .expect(200);

      expect(response.body.message).toBe('Points awarded successfully');
      expect(response.body.newPoints).toBe(175); // 150 + 25
      expect(response.body.badgeEarned).toBeTruthy();
    });

    it('should handle level progression', async () => {
      // Set user to high points to trigger level up
      testUser.points = 950;
      await testUser.save();

      const awardData = {
        points: 100,
        reason: 'Major achievement'
      };

      const response = await request(app)
        .post('/api/gamification/award-points')
        .set('Authorization', `Bearer ${userToken}`)
        .send(awardData)
        .expect(200);

      expect(response.body.levelUp).toBeTruthy();
      expect(response.body.newLevel).toBe('Silver');
    });

    it('should reject negative points', async () => {
      const awardData = {
        points: -50,
        reason: 'Penalty'
      };

      await request(app)
        .post('/api/gamification/award-points')
        .set('Authorization', `Bearer ${userToken}`)
        .send(awardData)
        .expect(400);
    });
  });

  describe('POST /api/gamification/update-streak', () => {
    it('should update user streak on daily visit', async () => {
      const response = await request(app)
        .post('/api/gamification/update-streak')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.streakUpdated).toBeTruthy();
      expect(response.body.currentStreak).toBeGreaterThan(3);
    });

    it('should reset streak after missing a day', async () => {
      // Set last visit to 2 days ago
      testUser.streak.lastVisit = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      await testUser.save();

      const response = await request(app)
        .post('/api/gamification/update-streak')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.streakReset).toBeTruthy();
      expect(response.body.currentStreak).toBe(1);
    });

    it('should award streak bonus points', async () => {
      // Set streak to 7 days for bonus
      testUser.streak.current = 7;
      await testUser.save();

      const response = await request(app)
        .post('/api/gamification/update-streak')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.streakBonus).toBeTruthy();
      expect(response.body.bonusPoints).toBeGreaterThan(0);
    });
  });

  describe('POST /api/gamification/track-activity', () => {
    it('should track user activity and award points', async () => {
      const activityData = {
        type: 'product_view',
        productId: '507f1f77bcf86cd799439011',
        metadata: {
          category: 'T-Shirts',
          sustainabilityScore: 8
        }
      };

      const response = await request(app)
        .post('/api/gamification/track-activity')
        .set('Authorization', `Bearer ${userToken}`)
        .send(activityData)
        .expect(200);

      expect(response.body.activityTracked).toBeTruthy();
      expect(response.body.pointsAwarded).toBeGreaterThanOrEqual(0);
    });

    it('should handle purchase activity with higher rewards', async () => {
      const activityData = {
        type: 'purchase',
        productId: '507f1f77bcf86cd799439011',
        amount: 75.00,
        metadata: {
          sustainabilityScore: 9
        }
      };

      const response = await request(app)
        .post('/api/gamification/track-activity')
        .set('Authorization', `Bearer ${userToken}`)
        .send(activityData)
        .expect(200);

      expect(response.body.pointsAwarded).toBeGreaterThan(0);
      expect(response.body.achievementUnlocked).toBeTruthy();
    });

    it('should reject invalid activity types', async () => {
      const activityData = {
        type: 'invalid_activity',
        productId: '507f1f77bcf86cd799439011'
      };

      await request(app)
        .post('/api/gamification/track-activity')
        .set('Authorization', `Bearer ${userToken}`)
        .send(activityData)
        .expect(400);
    });
  });

  describe('GET /api/gamification/leaderboard', () => {
    beforeEach(async () => {
      // Create additional users for leaderboard
      const users = [
        { username: 'user1', points: 500, level: 'Gold' },
        { username: 'user2', points: 300, level: 'Silver' },
        { username: 'user3', points: 200, level: 'Bronze' },
        { username: 'user4', points: 100, level: 'New' }
      ];

      for (const userData of users) {
        const passwordHash = await bcrypt.hash('password123', 10);
        const user = new User({
          ...userData,
          passwordHash,
          email: `${userData.username}@example.com`,
          role: 'customer'
        });
        await user.save();
      }
    });

    it('should return leaderboard sorted by points', async () => {
      const response = await request(app)
        .get('/api/gamification/leaderboard')
        .expect(200);

      expect(response.body).toHaveProperty('leaderboard');
      expect(response.body.leaderboard).toHaveLength(5); // Including testUser

      // Check sorting by points (descending)
      const points = response.body.leaderboard.map(u => u.points);
      expect(points).toEqual([...points].sort((a, b) => b - a));
    });

    it('should include user ranking information', async () => {
      const response = await request(app)
        .get('/api/gamification/leaderboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('userRank');
      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body.userRank).toBeGreaterThan(0);
      expect(response.body.totalUsers).toBe(5);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/gamification/leaderboard?page=1&limit=3')
        .expect(200);

      expect(response.body.leaderboard).toHaveLength(3);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.totalPages).toBe(2);
    });

    it('should filter by level if specified', async () => {
      const response = await request(app)
        .get('/api/gamification/leaderboard?level=Gold')
        .expect(200);

      expect(response.body.leaderboard.every(u => u.level === 'Gold')).toBe(true);
    });
  });

  describe('Achievement System', () => {
    it('should unlock achievements based on activity', async () => {
      // Simulate multiple purchases to unlock achievement
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/gamification/track-activity')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            type: 'purchase',
            productId: `product${i}`,
            amount: 50.00
          });
      }

      const response = await request(app)
        .get('/api/gamification/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Should have unlocked new achievements
      expect(response.body.achievements.length).toBeGreaterThan(2);
    });

    it('should award bonus points for achievement milestones', async () => {
      const response = await request(app)
        .post('/api/gamification/track-activity')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'achievement_milestone',
          achievementId: 'eco_warrior',
          milestone: 10
        })
        .expect(200);

      expect(response.body.bonusPoints).toBeGreaterThan(0);
      expect(response.body.milestoneReached).toBeTruthy();
    });
  });

  describe('Badge System', () => {
    it('should award badges for specific actions', async () => {
      const response = await request(app)
        .post('/api/gamification/track-activity')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'review_posted',
          productId: '507f1f77bcf86cd799439011',
          reviewQuality: 'high'
        })
        .expect(200);

      expect(response.body.badgeEarned).toBeTruthy();
      expect(response.body.badgeName).toBe('Reviewer');
    });

    it('should not award duplicate badges', async () => {
      // Award the same badge twice
      await request(app)
        .post('/api/gamification/track-activity')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'review_posted',
          productId: '507f1f77bcf86cd799439011'
        });

      const response = await request(app)
        .post('/api/gamification/track-activity')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'review_posted',
          productId: '507f1f77bcf86cd799439012'
        })
        .expect(200);

      expect(response.body.badgeEarned).toBeFalsy();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Simulate database error by passing invalid user ID
      const invalidToken = testUtils.generateTestToken({
        id: 'invalid_id',
        username: 'testuser',
        role: 'customer'
      });

      await request(app)
        .get('/api/gamification/profile')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(500);
    });

    it('should validate input data', async () => {
      const invalidData = {
        points: 'not_a_number',
        reason: 123 // Should be string
      };

      await request(app)
        .post('/api/gamification/award-points')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData)
        .expect(400);
    });
  });
}); 