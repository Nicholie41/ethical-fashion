module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js'],
  collectCoverageFrom: [
    'routes/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Add back the setup file
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  // Fix module resolution with correct property name
  moduleNameMapper: {
    '^mongodb-memory-server$': '<rootDir>/node_modules/mongodb-memory-server/lib/index.js'
  },
  // Add module directories
  moduleDirectories: ['node_modules', '<rootDir>'],
  // Add test environment setup
  testEnvironmentOptions: {
    url: 'http://localhost'
  }
}; 