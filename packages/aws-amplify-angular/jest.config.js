module.exports = {
  preset: "jest-preset-angular",
  roots: ['src'],
  setupTestFrameworkScriptFile: "<rootDir>/src/setup-jest.ts",
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  transformIgnorePatterns: [
    "node_modules/(?!(ionic))"
  ],
  globals: {
    "ts-jest": {
      tsConfigFile: "src/tsconfig.spec.json",
      useBabelrc: true
    },
    "__TRANSFORM_HTML__": true
  }
}
