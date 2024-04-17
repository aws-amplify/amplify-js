module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 73,
			functions: 89,
			lines: 91,
			statements: 92,
		},
	},
};
