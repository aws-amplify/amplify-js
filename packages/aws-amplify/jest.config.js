module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 85,
			functions: 44,
			lines: 90,
			statements: 91,
		},
	},
};
