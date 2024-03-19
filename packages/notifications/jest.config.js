module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 73,
			functions: 90,
			lines: 91,
			statements: 92,
		},
	},
};
