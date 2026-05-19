#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Ethical Fashion Platform Test Suite...\n');

// Test configuration
const testConfig = {
  coverage: true,
  verbose: true,
  watch: false,
  bail: false
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.bold}${colors.blue}=== ${title} ===${colors.reset}\n`);
}

// Run tests with coverage
function runTests() {
  try {
    logSection('Running Test Suite');
    
    const command = [
      'npx jest',
      '--coverage',
      '--verbose',
      '--detectOpenHandles',
      '--forceExit',
      '--testTimeout=30000'
    ].join(' ');

    log(`Executing: ${command}`, 'yellow');
    
    const result = execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    return true;
  } catch (error) {
    log('❌ Tests failed!', 'red');
    return false;
  }
}

// Generate test report
function generateReport() {
  logSection('Generating Test Report');
  
  const coveragePath = path.join(process.cwd(), 'coverage');
  const reportPath = path.join(process.cwd(), 'test-report.md');
  
  if (fs.existsSync(path.join(coveragePath, 'lcov-report', 'index.html'))) {
    log('✅ Coverage report generated successfully', 'green');
    log(`📊 View coverage report: ${path.join(coveragePath, 'lcov-report', 'index.html')}`, 'blue');
  }

  // Create markdown report
  const report = `# Ethical Fashion Platform - Test Report

## Test Summary
- **Date**: ${new Date().toISOString()}
- **Environment**: ${process.env.NODE_ENV || 'development'}
- **Test Framework**: Jest + Supertest
- **Coverage**: Generated in \`coverage/\` directory

## Test Categories

### 1. Authentication Tests (\`auth.test.js\`)
- User registration with role validation
- Login with credential verification
- JWT token generation and validation
- Password hashing and security
- Error handling for invalid inputs

### 2. Products API Tests (\`products.test.js\`)
- Product CRUD operations
- Advanced filtering and search
- Sustainability score computation
- Supplier dashboard functionality
- Admin approval workflow
- Product analytics tracking

### 3. Gamification Tests (\`gamification.test.js\`)
- Points and level progression
- Achievement unlocking system
- Badge awarding mechanism
- Streak tracking and bonuses
- Leaderboard functionality
- Activity tracking integration

### 4. Integration Tests (\`integration.test.js\`)
- Complete e-commerce user journey
- Cross-module functionality
- Error handling and edge cases
- Concurrent operation handling
- API health and performance

## Key Features Tested

### 🔐 Security & Authentication
- Password hashing with bcrypt
- JWT token validation
- Role-based access control
- Input validation and sanitization

### 🛍️ E-commerce Functionality
- Product creation and management
- Advanced search and filtering
- Order processing workflow
- Supplier dashboard analytics

### 🎮 Gamification System
- Points and rewards system
- Achievement and badge mechanics
- User engagement tracking
- Leaderboard and social features

### 🌱 Sustainability Focus
- Sustainability score computation
- Eco-friendly product filtering
- Environmental impact tracking
- Sustainable shopping incentives

## Test Coverage

The test suite provides comprehensive coverage of:
- **API Endpoints**: All critical routes and methods
- **Business Logic**: Core application functionality
- **Data Validation**: Input sanitization and validation
- **Error Handling**: Graceful error responses
- **Security**: Authentication and authorization
- **Integration**: Cross-module interactions

## Running Tests

\`\`\`bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.test.js

# Run tests in watch mode
npm test -- --watch
\`\`\`

## Continuous Integration

This test suite is designed to run in CI/CD pipelines:
- Fast execution with in-memory database
- Comprehensive coverage reporting
- Clear pass/fail indicators
- Detailed error reporting

## Maintenance

- Tests are automatically cleaned up after each run
- Database state is reset between tests
- Mock data is isolated and non-persistent
- Test utilities are centralized for consistency
`;

  fs.writeFileSync(reportPath, report);
  log(`📝 Test report saved: ${reportPath}`, 'green');
}

// Main execution
function main() {
  log('🚀 Ethical Fashion Platform - Automated Testing Suite', 'bold');
  log('Testing sustainable e-commerce with gamification and personalization\n', 'blue');

  const success = runTests();
  
  if (success) {
    generateReport();
    log('\n✅ All tests completed successfully!', 'green');
    log('📈 Check the coverage report for detailed metrics', 'blue');
  } else {
    log('\n❌ Test suite failed. Please check the errors above.', 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runTests, generateReport }; 