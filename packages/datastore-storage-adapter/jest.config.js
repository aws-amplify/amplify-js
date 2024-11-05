module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 82,
			functions: 97,
			lines: 88,
			statements: 88,
		},
	},
};
