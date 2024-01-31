module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 92,
			lines: 94,
			statements: 96,
		},
	},
};
