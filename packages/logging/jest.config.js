module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 97,
			lines: 100,
			statements: 100,
		},
	},
	moduleNameMapper: {
		// Force module uuid to resolve with the CJS entry point, because Jest does not support package.json.exports. See https://github.com/uuidjs/uuid/issues/451
		uuid: require.resolve('uuid'),
	},
};
