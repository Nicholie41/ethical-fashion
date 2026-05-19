// Security Implementation Page for Figure 9
import React, { useState } from 'react';

const SecurityImplementation = () => {
  const [activeTab, setActiveTab] = useState('authentication');
  const [showFlow, setShowFlow] = useState(false);

  const securityConfig = {
    authentication: {
      method: 'JWT (JSON Web Tokens)',
      algorithm: 'HS256',
      expiration: '24 hours',
      refreshToken: 'Enabled',
      passwordHashing: 'bcrypt (salt rounds: 12)',
      sessionManagement: 'Stateless'
    },
    authorization: {
      roleBasedAccess: 'RBAC Implementation',
      roles: ['customer', 'supplier', 'admin'],
      permissions: 'Granular permission system',
      middleware: 'Express.js middleware chain'
    },
    dataProtection: {
      encryption: 'AES-256 for sensitive data',
      hashing: 'SHA-256 for data integrity',
      ssl: 'TLS 1.3 enforced',
      database: 'MongoDB with encrypted connections'
    },
    inputValidation: {
      sanitization: 'Express-validator middleware',
      sqlInjection: 'Prevented via parameterized queries',
      xss: 'Content Security Policy (CSP)',
      csrf: 'CSRF tokens on all forms'
    },
    rateLimiting: {
      general: '100 requests per minute',
      auth: '5 attempts per 15 minutes',
      api: '1000 requests per hour',
      upload: '10 files per hour'
    }
  };

  const authenticationFlow = [
    {
      step: 1,
      title: 'User Registration',
      description: 'User submits registration form with validation',
      code: `POST /api/auth/register
{
  "username": "user123",
  "email": "user@example.com", 
  "password": "SecurePass123!"
}`,
      security: ['Password hashing with bcrypt', 'Email validation', 'Username uniqueness check']
    },
    {
      step: 2,
      title: 'Password Processing',
      description: 'Password is hashed and stored securely',
      code: `const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);
// Store: { username, email, passwordHash }`,
      security: ['bcrypt hashing (12 rounds)', 'Salt generation', 'Secure storage']
    },
    {
      step: 3,
      title: 'User Login',
      description: 'User attempts to authenticate',
      code: `POST /api/auth/login
{
  "username": "user123",
  "password": "SecurePass123!"
}`,
      security: ['Rate limiting', 'Input validation', 'Account lockout protection']
    },
    {
      step: 4,
      title: 'Password Verification',
      description: 'Password is verified against stored hash',
      code: `const isValid = await bcrypt.compare(password, user.passwordHash);
if (!isValid) {
  return res.status(401).json({ error: 'Invalid credentials' });
}`,
      security: ['Secure comparison', 'Timing attack protection', 'Error handling']
    },
    {
      step: 5,
      title: 'JWT Generation',
      description: 'JWT token is created and returned',
      code: `const token = jwt.sign(
  { id: user._id, username: user.username, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);`,
      security: ['JWT signing with secret', 'Token expiration', 'Role-based claims']
    },
    {
      step: 6,
      title: 'Token Storage',
      description: 'Token is stored securely on client',
      code: `// Client-side storage
localStorage.setItem('token', token);
// Include in requests
headers: {
  'Authorization': 'Bearer ' + token
}`,
      security: ['Secure storage', 'Automatic inclusion', 'Token refresh mechanism']
    },
    {
      step: 7,
      title: 'Request Authentication',
      description: 'Token is verified on each request',
      code: `// Middleware verification
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded;`,
      security: ['Token validation', 'User context injection', 'Error handling']
    },
    {
      step: 8,
      title: 'Authorization Check',
      description: 'User permissions are verified',
      code: `// Role-based authorization
if (req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Forbidden' });
}`,
      security: ['Role verification', 'Permission checking', 'Access control']
    }
  ];

  const SecurityFeature = ({ title, description, code, features }) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg mb-4 overflow-x-auto">
        <pre className="text-sm">{code}</pre>
      </div>
      <div className="flex flex-wrap gap-2">
        {features.map((feature, index) => (
          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            {feature}
          </span>
        ))}
      </div>
    </div>
  );

  const FlowStep = ({ step, title, description, code, security }) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
          {step}
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg mb-4 overflow-x-auto">
        <pre className="text-sm">{code}</pre>
      </div>
      <div className="flex flex-wrap gap-2">
        {security.map((item, index) => (
          <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            🔒 {item}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Implementation</h1>
          <p className="text-gray-600">Comprehensive security configurations and authentication flow for the Ethical Fashion Platform</p>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-900">Authentication</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">JWT</p>
            <p className="text-sm text-gray-600">JSON Web Tokens</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-900">Authorization</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">RBAC</p>
            <p className="text-sm text-gray-600">Role-Based Access Control</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-900">Encryption</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">AES-256</p>
            <p className="text-sm text-gray-600">Advanced Encryption Standard</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <h3 className="text-lg font-semibold text-gray-900">Rate Limiting</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">100/min</p>
            <p className="text-sm text-gray-600">Requests per minute</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('authentication')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'authentication'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🔐 Authentication
            </button>
            <button
              onClick={() => setActiveTab('authorization')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'authorization'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🛡️ Authorization
            </button>
            <button
              onClick={() => setActiveTab('dataProtection')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'dataProtection'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🔒 Data Protection
            </button>
            <button
              onClick={() => setActiveTab('inputValidation')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'inputValidation'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ✅ Input Validation
            </button>
            <button
              onClick={() => setActiveTab('rateLimiting')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'rateLimiting'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ⏱️ Rate Limiting
            </button>
          </div>
        </div>

        {/* Security Configuration Details */}
        {activeTab === 'authentication' && (
          <div>
            <SecurityFeature
              title="JWT Authentication Implementation"
              description="Secure token-based authentication using JSON Web Tokens with bcrypt password hashing"
              code={`// JWT Configuration
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Token generation
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      username: user.username, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Password hashing
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Password verification
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};`}
              features={[
                'JWT with HS256 algorithm',
                'bcrypt password hashing (12 rounds)',
                '24-hour token expiration',
                'Role-based token claims',
                'Secure password comparison'
              ]}
            />
          </div>
        )}

        {activeTab === 'authorization' && (
          <div>
            <SecurityFeature
              title="Role-Based Access Control (RBAC)"
              description="Granular permission system with middleware-based authorization"
              code={`// Authorization middleware
const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ 
        error: 'Forbidden: Insufficient privileges' 
      });
    }
  };
};

// Route protection
app.get('/api/admin/users', 
  authenticateToken, 
  authorizeRole('admin'), 
  adminController.getUsers
);

app.post('/api/supplier/products', 
  authenticateToken, 
  authorizeRole('supplier'), 
  supplierController.addProduct
);

// Permission checking
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const userPermissions = getUserPermissions(req.user.role);
    if (userPermissions.includes(requiredPermission)) {
      next();
    } else {
      res.status(403).json({ error: 'Permission denied' });
    }
  };
};`}
              features={[
                'Role-based middleware',
                'Granular permissions',
                'Route-level protection',
                'Permission checking',
                'Access control lists'
              ]}
            />
          </div>
        )}

        {activeTab === 'dataProtection' && (
          <div>
            <SecurityFeature
              title="Data Encryption & Protection"
              description="Comprehensive data protection with encryption, hashing, and secure connections"
              code={`// Data encryption
const crypto = require('crypto');

// AES-256 encryption
const encryptData = (data, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), data: encrypted };
};

// Data hashing for integrity
const hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Secure database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  sslValidate: true,
  sslCA: fs.readFileSync('./ca-certificate.crt')
});

// HTTPS configuration
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem'),
  ca: fs.readFileSync('ca-bundle.crt')
};`}
              features={[
                'AES-256 encryption',
                'SHA-256 hashing',
                'TLS 1.3 enforcement',
                'SSL certificate validation',
                'Secure database connections'
              ]}
            />
          </div>
        )}

        {activeTab === 'inputValidation' && (
          <div>
            <SecurityFeature
              title="Input Validation & Sanitization"
              description="Comprehensive input validation to prevent injection attacks and XSS"
              code={`// Input validation middleware
const { body, validationResult } = require('express-validator');

// Registration validation
const validateRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .escape(),
  body('email')
    .isEmail()
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])/)
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array() 
      });
    }
    next();
  }
];

// SQL injection prevention
const sanitizeInput = (input) => {
  return input.replace(/[<>\"'&]/g, '');
};

// XSS prevention
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));`}
              features={[
                'Express-validator middleware',
                'SQL injection prevention',
                'XSS protection (CSP)',
                'CSRF token validation',
                'Input sanitization'
              ]}
            />
          </div>
        )}

        {activeTab === 'rateLimiting' && (
          <div>
            <SecurityFeature
              title="Rate Limiting & DDoS Protection"
              description="Multi-tier rate limiting to prevent abuse and DDoS attacks"
              code={`// Rate limiting configuration
const rateLimit = require('express-rate-limit');

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
});

// Authentication rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts',
  skipSuccessfulRequests: true
});

// API rate limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // limit each IP to 1000 requests per hour
  message: 'API rate limit exceeded'
});

// File upload rate limiting
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: 'Upload rate limit exceeded'
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/upload/', uploadLimiter);`}
              features={[
                'Multi-tier rate limiting',
                'IP-based restrictions',
                'DDoS protection',
                'Authentication throttling',
                'Upload rate control'
              ]}
            />
          </div>
        )}

        {/* Authentication Flow */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Authentication Flow</h2>
            <button
              onClick={() => setShowFlow(!showFlow)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              {showFlow ? 'Hide Flow' : 'Show Flow'}
            </button>
          </div>
          
          {showFlow && (
            <div className="space-y-6">
              {authenticationFlow.map((flowStep) => (
                <FlowStep
                  key={flowStep.step}
                  step={flowStep.step}
                  title={flowStep.title}
                  description={flowStep.description}
                  code={flowStep.code}
                  security={flowStep.security}
                />
              ))}
            </div>
          )}
        </div>

        {/* Security Checklist */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Implementation Checklist</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Implemented Security Features</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  JWT-based authentication
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  bcrypt password hashing
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Role-based access control
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Input validation & sanitization
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Rate limiting & DDoS protection
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  HTTPS/TLS enforcement
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Content Security Policy
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  CSRF protection
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔒 Security Headers</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">🔒</span>
                  X-Frame-Options: SAMEORIGIN
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">🔒</span>
                  X-XSS-Protection: 1; mode=block
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">🔒</span>
                  X-Content-Type-Options: nosniff
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">🔒</span>
                  Strict-Transport-Security: max-age=31536000
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">🔒</span>
                  Content-Security-Policy: default-src 'self'
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">🔒</span>
                  Referrer-Policy: no-referrer-when-downgrade
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityImplementation; 