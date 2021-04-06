const { defaults } = require('jest-config');
module.exports = {

    testPathIgnorePatterns: [
        ...defaults.testPathIgnorePatterns,
        '__tests__/util.js',
        '__tests__/constants.js'
    ],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.js'],
    
    coverageThreshold: {
        "global": {
            "branches": 80,
            "functions": 80,
            "lines": 80,
            "statements": 80
        }
    },

    globals: {
        "ts-jest": {
            "diagnostics": false,
            "tsConfig": {
                "lib": [
                    "es5",
                    "es2015",
                    "dom",
                    "esnext.asynciterable",
                    "es2017.object"
                ],
                "allowJs": true,
                "esModuleInterop": true
            }
        }
    },

    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "ts-jest"
    },
    preset: "ts-jest",
    testRegex: ["(/__tests__/.*|\\.(test|spec))\\.(tsx?|jsx?)$"],
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "json",
        "jsx"
    ],

    testEnvironment: "jsdom",
    testURL: "http://localhost/",
};