module.exports = {
	preset: 'react-native',
	modulePathIgnorePatterns: ['<rootDir>/dist/'],
	collectCoverageFrom: ['<rootDir>/src/**/*.{js,jsx,ts,tsx}', '!<rootDir>/src/**/*{c,C}onstants.ts'],
	coverageThreshold: {
		global: {
			branches: 24,
			functions: 20,
			lines: 24,
			statements: 24,
		},
	},
};
