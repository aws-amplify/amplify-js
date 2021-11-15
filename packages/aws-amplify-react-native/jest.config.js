module.exports = {
	preset: 'react-native',
	modulePathIgnorePatterns: ['<rootDir>/dist/'],
	collectCoverageFrom: ['<rootDir>/src/**/*.{js,jsx,ts,tsx}', '!<rootDir>/src/**/*{c,C}onstants.ts'],
	coverageThreshold: {
		global: {
			branches: 16,
			functions: 9,
			lines: 16,
			statements: 16,
		},
	},
};
