# How to Capture Test Screenshots

## Quick Steps

1. **Open Terminal/Command Prompt**
2. **Navigate to backend directory**: `cd backend`
3. **Run tests**: `npm run test:coverage`
4. **Take screenshots at key moments**

## Screenshot Points

### 1. Test Execution Start
Capture when you see:
```
🧪 Starting Ethical Fashion Platform Test Suite...
=== Running Test Suite ===
```

### 2. Individual Test Results
Capture each test file execution:
```
PASS __tests__/auth.test.js
  Authentication Routes
    ✓ should register a new customer user successfully
    ✓ should login successfully with valid credentials
```

### 3. Coverage Report
Capture the coverage table:
```
---------------------|---------|----------|---------|---------|-------------------
File                 | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------------|---------|----------|---------|---------|-------------------
All files            |   85.23 |    82.15 |   90.45 |   85.67 |                   
```

### 4. Final Summary
Capture the final results:
```
Test Suites: 4 passed, 4 total
Tests:       55 passed, 55 total
Time:        12.34 s
```

## Screenshot Tools

- **Windows**: Press `Win + Shift + S`
- **macOS**: Press `Cmd + Shift + 4`
- **Linux**: Press `PrtScn`

## Include in Documentation

Add screenshots to your documentation like this:

```markdown
## Testing Screenshots

### Test Execution
![Test Execution](screenshots/test-execution.png)

### Coverage Report
![Coverage Report](screenshots/coverage-report.png)

### Final Results
![Final Results](screenshots/final-results.png)
```

## Example Commands

```bash
# Run all tests with coverage
npm run test:coverage

# Run specific test categories
npm run test:auth
npm run test:products
npm run test:gamification

# Run with verbose output
npm test -- --verbose
``` 