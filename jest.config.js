module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!(@modelcontextprotocol/sdk|pkce-challenge))/'],
};
