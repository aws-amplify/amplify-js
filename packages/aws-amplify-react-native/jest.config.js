module.exports = {
	preset: 'react-native',
	modulePathIgnorePatterns: ['<rootDir>/dist/'],
	collectCoverageFrom: ['<rootDir>/src/**/*.{js,jsx,ts,tsx}', '!<rootDir>/src/**/*{c,C}onstants.ts'],
	coverageThreshold: {
		global: {
			branches: 22,
			functions: 15,
			lines: 20,
			statements: 20,
		},
	},
};
