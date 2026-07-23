// Import required dependencies for authentication API
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const router = express.Router();
const VALID_ROLES = ['customer', 'supplier', 'admin'];
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Registration route (returns token on success)
router.post('/register', async (req, res) => {
  const { username, password, email, role } = req.body;
  
  // Log registration attempt
  console.log('🔐 Registration attempt:', { username, email, role });
  
  if (!username || !password) {
    console.log('❌ Registration failed: Missing username or password');
    return res.status(400).json({ error: 'Missing username or password' });
  }
  // Default to 'customer', only allow valid roles except admin via registration
  let userRole = VALID_ROLES.includes(role && role.toLowerCase()) && role.toLowerCase() !== "admin" ? role.toLowerCase() : 'customer';

  try {
    const existing = await User.findOne({ username });
    if (existing) {
      console.log('❌ Registration failed: Username already taken -', username);
      return res.status(409).json({ error: 'Username already taken' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user with gamification defaults
    const user = new User({ 
      username, 
      passwordHash, 
      email, 
      role: userRole,
      points: 50, // Welcome bonus
      level: 'New',
      achievements: [{
        id: 'welcome',
        name: 'Welcome Bonus',
        icon: '🎉',
        description: 'Join our community',
        points: 50
      }],
      streak: {
        current: 0,
        longest: 0,
        lastVisit: new Date()
      }
    });
    await user.save();

    // Generate JWT token for new user
    const token = jwt.sign(
      { username: user.username, id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    // Log successful registration
    console.log('✅ Registration successful:', {
      username: user.username,
      role: user.role,
      points: user.points,
      level: user.level,
      token: token.substring(0, 20) + '...'
    });

    res.status(201).json({
      token,
      user: { 
        username: user.username, 
        id: user._id, 
        role: user.role,
        points: user.points,
        level: user.level
      },
      role: user.role
    });
  } catch (err) {
    console.log('❌ Registration error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Login route (returns token on success)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Log login attempt
  console.log('🔑 Login attempt:', { username });
  
  const user = await User.findOne({ username });
  if (!user) {
    console.log('❌ Login failed: User not found -', username);
    return res.status(400).json({ error: 'Invalid username or password' });
  }

  if (!VALID_ROLES.includes(user.role)) {
    console.log('❌ Login failed: Invalid user role -', user.role);
    return res.status(403).json({ error: 'Invalid user role.' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    console.log('❌ Login failed: Invalid password for user -', username);
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Always lowercase for consistency
  const userRole = (user.role || '').toLowerCase();

  const token = jwt.sign(
    { username: user.username, id: user._id, role: userRole },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1h' }
  );
  
  // Log successful login
  console.log('✅ Login successful:', {
    username: user.username,
    role: userRole,
    points: user.points,
    level: user.level,
    token: token.substring(0, 20) + '...'
  });
  
  res.json({
    token,
    user: { username: user.username, id: user._id, role: userRole },
    role: userRole
  });
});

// Google Sign-In route
// Frontend sends the Google ID token it received from Google's sign-in widget.
// We verify it directly with Google's servers, then find-or-create the matching user.
router.post('/google', async (req, res) => {
  const { credential, role } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Missing Google credential' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email_verified) {
      return res.status(401).json({ error: 'Google account email is not verified' });
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      // Build a unique username from the Google account, since our schema is username-based
      const baseUsername = (payload.name || email.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .slice(0, 20) || 'user';

      let username = baseUsername;
      let suffix = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${suffix}`;
        suffix += 1;
      }

      let userRole = VALID_ROLES.includes(role && role.toLowerCase()) && role.toLowerCase() !== 'admin'
        ? role.toLowerCase()
        : 'customer';

      // Google-authenticated accounts don't use a password; store an unusable random hash
      const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

      user = new User({
        username,
        passwordHash,
        email,
        role: userRole,
        points: 50,
        level: 'New',
        achievements: [{
          id: 'welcome',
          name: 'Welcome Bonus',
          icon: '🎉',
          description: 'Join our community',
          points: 50
        }],
        streak: { current: 0, longest: 0, lastVisit: new Date() }
      });
      await user.save();
      console.log('✅ New user created via Google Sign-In:', username);
    }

    const userRole = (user.role || '').toLowerCase();
    const token = jwt.sign(
      { username: user.username, id: user._id, role: userRole },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: { username: user.username, id: user._id, role: userRole },
      role: userRole
    });
  } catch (err) {
    console.log('❌ Google Sign-In error:', err.message);
    res.status(401).json({ error: 'Google Sign-In verification failed' });
  }
});

module.exports = router;