module.exports = {
	parser: '@typescript-eslint/parser', // Specifies the ESLint parser
	extends: [
		'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
		'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
		'plugin:@stencil/recommended',
	],
	parserOptions: {
		ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
		sourceType: 'module', // Allows for the use of imports
		project: './tsconfig.json',
	},
	overrides: [
		{
			files: ['*.stories.tsx'],
			rules: {
				'@stencil/ban-side-effects': 'off',
			},
		},
		{
			files: ['*.tsx', '*.ts', '*.js'],
			rules: {
				'@stencil/strict-boolean-conditions': 'off',
			},
		},
	],
	rules: {
		'@typescript-eslint/explicit-function-return-type': 0,
		'@typescript-eslint/explicit-member-accessibility': 0,
		'@typescript-eslint/no-empty-interface': 0,
		'@typescript-eslint/no-explicit-any': 0,
		'@typescript-eslint/no-unused-vars': 0,
		'@typescript-eslint/camelcase': 0,
		'@typescript-eslint/no-inferrable-types': 0,
		'@typescript-eslint/explicit-module-boundary-types': 0,
		'@typescript-eslint/no-empty-function': 0,
		'@typescript-eslint/ban-ts-comment': 0,
		'@typescript-eslint/ban-types': 0,
		'@stencil/decorators-style': 0
	},
};
