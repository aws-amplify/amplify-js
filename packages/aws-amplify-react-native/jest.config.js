const { moduleNameMapper } = require('../notifications/jest.config');

module.exports = {
	preset: 'react-native',
	modulePathIgnorePatterns: ['<rootDir>/dist/'],
	moduleNameMapper: {
		'universal-cookie': '<rootDir>/../../node_modules/universal-cookie/cjs/index.js',
	},
};
