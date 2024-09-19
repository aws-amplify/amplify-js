// TODO(ashwinkumar6): increase coverage back to original limits
module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 72,
			functions: 72,
			lines: 81,
			statements: 87,
		},
	},
};
