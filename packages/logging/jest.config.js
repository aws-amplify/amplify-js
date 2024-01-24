module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 90, // todo(ashwinkumar6): temp, add tests cw client
			lines: 100,
			statements: 100,
		},
	},
};
