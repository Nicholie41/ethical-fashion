# How to Capture Test Screenshots for Documentation

## Overview

This guide explains how to capture screenshots of the automated test output for inclusion in your project documentation, as requested in the original requirements.

## Prerequisites

1. **Terminal/Command Prompt**: You'll need access to a terminal or command prompt
2. **Screenshot Tool**: Use your operating system's built-in screenshot tool or a third-party application
3. **Test Suite**: Ensure the testing system is properly set up

## Step-by-Step Instructions

### 1. Run the Test Suite

First, navigate to the backend directory and run the tests:

```bash
cd backend
npm run test:coverage
```

### 2. Capture Screenshots at Key Points

#### **A. Test Execution Start**
- Run the command and immediately capture the terminal showing:
  - Test suite initialization
  - Jest configuration loading
  - Database connection setup

#### **B. Individual Test Results**
- Capture screenshots showing:
  - Test file execution (e.g., `auth.test.js`)
  - Individual test case results with green checkmarks (✓)
  - Test execution times

#### **C. Coverage Report**
- Capture the coverage summary showing:
  - Statement coverage percentage
  - Branch coverage percentage
  - Function coverage percentage
  - Line coverage percentage
  - File-by-file breakdown

#### **D. Final Test Summary**
- Capture the final summary showing:
  - Total test suites passed/failed
  - Total tests passed/failed
  - Total execution time
  - Coverage report location

### 3. Screenshot Examples

Here are the types of screenshots you should capture:

#### **Example 1: Test Execution Output**
```
🧪 Starting Ethical Fashion Platform Test Suite...

=== Running Test Suite ===

Executing: npx jest --coverage --verbose --detectOpenHandles --forceExit --testTimeout=30000

PASS __tests__/auth.test.js
  Authentication Routes
    POST /api/auth/register
      ✓ should register a new customer user successfully (45ms)
      ✓ should register a supplier user successfully (23ms)
      ✓ should not allow admin registration via public endpoint (18ms)
      ✓ should return 400 for missing username (12ms)
      ✓ should return 400 for missing password (11ms)
      ✓ should return 409 for duplicate username (34ms)
      ✓ should hash password before saving (28ms)
    POST /api/auth/login
      ✓ should login successfully with valid credentials (23ms)
      ✓ should return 400 for non-existent username (12ms)
      ✓ should return 401 for incorrect password (15ms)
      ✓ should return 403 for invalid user role (18ms)
      ✓ should handle case-insensitive role comparison (22ms)
```

#### **Example 2: Coverage Report**
```
---------------------|---------|----------|---------|---------|-------------------
File                 | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------------|---------|----------|---------|---------|-------------------
All files            |   85.23 |    82.15 |   90.45 |   85.67 |                   
 routes/auth.js      |   95.45 |    88.90 |  100.00 |   95.45 | 45,67             
 routes/products.js  |   82.15 |    78.45 |   85.67 |   82.15 | 123,456,789       
 routes/gamification |   88.90 |    85.23 |   92.34 |   88.90 | 234,567           
 middleware/auth.js  |   90.12 |    87.65 |   95.67 |   90.12 | 89,156            
 models/User.js      |   85.67 |    82.34 |   88.90 |   85.67 | 45,123,234        
 models/Product.js   |   87.34 |    84.56 |   91.23 |   87.34 | 67,89,156         
---------------------|---------|----------|---------|---------|-------------------
Test Suites: 4 passed, 4 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        8.45 s
Ran all test suites.
```

#### **Example 3: Test Categories Breakdown**
```
PASS __tests__/auth.test.js (12 tests)
PASS __tests__/products.test.js (15 tests)
PASS __tests__/gamification.test.js (20 tests)
PASS __tests__/integration.test.js (8 tests)

Test Suites: 4 passed, 4 total
Tests:       55 passed, 55 total
Snapshots:   0 total
Time:        12.34 s
```

### 4. Screenshot Tools by Operating System

#### **Windows**
- **Snipping Tool**: Press `Win + Shift + S`
- **Print Screen**: Press `PrtScn` key
- **Windows + Print Screen**: Saves directly to Pictures folder

#### **macOS**
- **Screenshot**: Press `Cmd + Shift + 4`
- **Screenshot with timer**: Press `Cmd + Shift + 5`
- **Full screen**: Press `Cmd + Shift + 3`

#### **Linux**
- **GNOME Screenshot**: Press `PrtScn`
- **KDE Spectacle**: Press `PrtScn`
- **Command line**: Use `gnome-screenshot` or `spectacle`

### 5. Recommended Screenshot Sequence

1. **Terminal Setup**: Show the command being executed
2. **Test Initialization**: Capture Jest starting up
3. **Individual Test Files**: Show each test file execution
4. **Coverage Report**: Capture the detailed coverage breakdown
5. **Final Summary**: Show the overall test results
6. **Coverage HTML**: If available, capture the HTML coverage report

### 6. Screenshot Organization

Organize your screenshots with descriptive names:

```
test-screenshots/
├── 01-test-execution-start.png
├── 02-auth-tests-passing.png
├── 03-products-tests-passing.png
├── 04-gamification-tests-passing.png
├── 05-integration-tests-passing.png
├── 06-coverage-report-summary.png
├── 07-coverage-detailed-breakdown.png
├── 08-final-test-summary.png
└── 09-coverage-html-report.png
```

### 7. Including Screenshots in Documentation

Once you have the screenshots, include them in your documentation:

```markdown
## Testing Screenshots

### Test Execution
![Test Execution Start](test-screenshots/01-test-execution-start.png)

### Authentication Tests
![Authentication Tests Passing](test-screenshots/02-auth-tests-passing.png)

### Products API Tests
![Products Tests Passing](test-screenshots/03-products-tests-passing.png)

### Gamification Tests
![Gamification Tests Passing](test-screenshots/04-gamification-tests-passing.png)

### Coverage Report
![Coverage Summary](test-screenshots/06-coverage-report-summary.png)

### Final Results
![Final Test Summary](test-screenshots/08-final-test-summary.png)
```

### 8. Alternative: Video Recording

For a more dynamic demonstration, consider recording a short video:

```bash
# Using screen recording tools
# Windows: Xbox Game Bar (Win + G)
# macOS: QuickTime Player
# Linux: SimpleScreenRecorder or OBS Studio
```

### 9. Troubleshooting

#### **If Tests Don't Run:**
1. Ensure all dependencies are installed: `npm install`
2. Check MongoDB connection
3. Verify Jest configuration
4. Run with verbose output: `npm test -- --verbose`

#### **If Screenshots Are Blurry:**
1. Use high DPI settings
2. Increase terminal font size
3. Use full-screen terminal
4. Consider using a different terminal emulator

#### **If Coverage Report Doesn't Generate:**
1. Ensure `--coverage` flag is used
2. Check Jest configuration
3. Verify coverage reporters are configured
4. Run: `npm run test:coverage`

### 10. Best Practices

1. **Consistent Timing**: Take screenshots at the same point in test execution
2. **Clear Context**: Ensure the terminal window shows relevant information
3. **High Quality**: Use high-resolution screenshots
4. **Descriptive Names**: Use clear, descriptive filenames
5. **Multiple Angles**: Capture different aspects of the testing process
6. **Error Cases**: Also capture screenshots of error handling (if any)

## Example Commands to Run

```bash
# Basic test execution
npm test

# With coverage
npm run test:coverage

# With verbose output
npm test -- --verbose

# Specific test file
npm test -- auth.test.js

# With watch mode (for development)
npm run test:watch

# Full test suite with reporting
npm run test:report
```

## Conclusion

By following this guide, you'll be able to capture comprehensive screenshots of your automated testing system in action. These screenshots will provide visual evidence of the testing infrastructure and can be included in your project documentation to demonstrate the reliability and coverage of your ethical fashion platform.

Remember to update the screenshots whenever you make significant changes to the test suite or when running tests on different environments. 