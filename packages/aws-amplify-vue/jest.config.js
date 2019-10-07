module.exports = {
  moduleFileExtensions: ['js', 'json', 'vue', 'ts'],

  transform: {
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  snapshotSerializers: ['jest-serializer-vue'],
  testMatch: ['<rootDir>/__tests__/*.test.ts'],
  testURL: 'http://localhost/',
  testEnvironment: "node",
  collectCoverage: true,
  coverageReporters: ['lcov'],
  setupTestFrameworkScriptFile: '<rootDir>/test_setup/setup-jest.ts',
};
