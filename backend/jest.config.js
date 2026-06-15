/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  // Fail fast in CI — coverage thresholds enforced here
  coverageThreshold: {
    global: {
      branches: 35,
      functions: 40,
      lines: 40,
      statements: 40,
    },
  },
  // Prevent test suite from hanging indefinitely
  testTimeout: 10000,
  // Clear mocks between tests automatically
  clearMocks: true,
  // Ignore node_modules except for ESM packages if needed
  transformIgnorePatterns: ['/node_modules/'],
  // Silence noisy console output in tests (override per-test with jest.spyOn)
  verbose: true,
};
