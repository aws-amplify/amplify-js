module.exports = {
  preset: "jest-preset-angular",
  roots: ['src'],
  setupTestFrameworkScriptFile: "<rootDir>/test_setup/setup-jest.ts",
  testURL: 'http://localhost/'
}
