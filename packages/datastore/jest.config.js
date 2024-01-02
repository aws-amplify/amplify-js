module.exports = {
	...require('../../jest.config'),
	moduleNameMapper: {
		...require('../../jest.config').moduleNameMapper,
		'^dexie$': require.resolve('dexie'),
	},
	coverageThreshold: {
		global: {
			branches: 82,
			functions: 94,
			lines: 89,
			statements: 89,
		},
	},
	moduleNameMapper: {
		uuid: require.resolve('uuid'),
	},
};
