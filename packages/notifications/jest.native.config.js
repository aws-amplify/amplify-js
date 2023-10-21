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
			statements: 0,
			branches: 0,
			lines: 0,
			functions: 0,
		},
	},
};
