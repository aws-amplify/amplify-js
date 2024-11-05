module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 94,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},
};
