module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 25,
			functions: 25,
			lines: 35,
			statements: 35,
		},
	},
};
