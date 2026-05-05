module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 64,
			functions: 86,
			lines: 89,
			statements: 89,
		},
	},
	moduleNameMapper: {
		uuid: require.resolve('uuid'),
		// `@aws-amplify/storage` uses conditional exports where the default
		// Node resolution targets a CJS server bundle. Under `jsdom`, Jest
		// picks the `browser` condition which points at raw `.mjs` that the
		// default transform cannot parse. Predictions only consumes `getUrl`
		// from storage, so map the package to a minimal global manual mock.
		// This avoids loading the real module and removes the need to pin
		// `customExportConditions: ['node']` in this package's test env.
		'^@aws-amplify/storage$':
			'<rootDir>/__tests__/__mocks__/aws-amplify-storage.js',
	},
};
