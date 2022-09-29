module.exports = {
	preset: 'react-native',
	modulePathIgnorePatterns: ['<rootDir>/dist/'],
	transformIgnorePatterns: ['node_modules/(?!(@react-native|react-native|react-native-safe-area-context)/)'],
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
