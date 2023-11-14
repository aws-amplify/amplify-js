module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 42,
			functions: 58,
			lines: 65,
			statements: 68,
		},
	},
};
