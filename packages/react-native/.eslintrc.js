/** @type {import("eslint").ESLint.ConfigData}*/
module.exports = {
	extends: '../../.eslintrc.js',
	rules: {
		'no-relative-import-paths/no-relative-import-paths': [
			'error',
			{
				allowSameFolder: true,
				prefix: '~',
				rootDir: 'packages/react-native',
			},
		],
	},
};
