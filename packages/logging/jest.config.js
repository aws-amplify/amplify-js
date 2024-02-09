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
};
