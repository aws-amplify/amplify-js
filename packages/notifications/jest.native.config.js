module.exports = {
	preset: 'react-native',
	transform: {
		'^.+\\.(js|jsx)$': 'babel-jest',
		'^.+\\.(ts|tsx)$': 'ts-jest',
	},
	testMatch: ['**/__tests__/**/*.native.+(test|spec).[jt]s'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	testEnvironment: 'jsdom',
	collectCoverageFrom: ['**/src/**/*.native.*'],
	coverageThreshold: {
		global: {
			statements: 95,
			branches: 85,
			lines: 95,
			functions: 95,
		},
	},
};
