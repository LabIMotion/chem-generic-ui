module.exports = {
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  // setupFilesAfterEnv: ['jest-extended/all'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.js'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  // Test files matching this pattern will be considered for running tests.
  testRegex: '\\.test\\.js$',

  // Directories to search for tests.
  testPathIgnorePatterns: ['/node_modules/'],

  // Environment setup for tests.
  testEnvironment: 'jsdom',
};
