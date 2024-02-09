module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 50,
			functions: 70,
			lines: 80,
			statements: 80,
		},
	},
	moduleNameMapper: {
		// Force module uuid to resolve with the CJS entry point, because Jest does not support package.json.exports. See https://github.com/uuidjs/uuid/issues/451
		uuid: require.resolve('uuid'),
	},
};
