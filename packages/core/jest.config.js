module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 74, // todo(ashwinkumar6): temp, add tests and bump back
			functions: 72,
			lines: 87, // todo(ashwinkumar6): temp, add tests and bump back
			statements: 88,
		},
	},
};
