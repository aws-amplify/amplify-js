module.exports = {
	globals: {
		'ts-jest': {
			tsConfig: {
				esModuleInterop: true,
				jsx: 'react',
			},
		},
	},
	preset: 'ts-jest',
	testEnvironment: 'node',
};
