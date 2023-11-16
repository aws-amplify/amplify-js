// This eslintrc is used when running `eslint src` (yarn lint) in the scope of each package in the lerna workspace
// so that the no-relative-import-paths plugin can correctly apply rule checks

/** @type {import("eslint").ESLint.ConfigData}*/
module.exports = {
	extends: '.eslintrc.js',
	rules: {
		'no-relative-import-paths/no-relative-import-paths': [
			'error',
			{
				allowSameFolder: true,
				prefix: '~',
				// relative to the root of a package itself
				rootDir: '.',
			},
		],
	},
};
