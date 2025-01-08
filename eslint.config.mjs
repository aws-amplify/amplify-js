import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import stylistic from '@stylistic/eslint-plugin';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import unusedImports from 'eslint-plugin-unused-imports';
import _import from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

import customClientDtsBundlerConfig from './scripts/dts-bundler/dts-bundler.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});
const customClientDtsFiles = customClientDtsBundlerConfig.entries
	.map(clientBundlerConfig => clientBundlerConfig.outFile)
	.filter(outFile => outFile?.length > 0)
	.map(outFile => outFile.replace(__dirname + path.sep, '')); // Convert absolute path to relative path

export default [
	{
		ignores: [
			'**/dist',
			'**/node_modules',
			'**/.eslintrc.*',
			'**/rollup',
			'**/rollup.config.*',
			'**/.rollup.cache',
			'**/setupTests.ts',
			'**/jest.setup.*',
			'**/jest.config.*',
			'packages/api/__tests__',
			'packages/api-graphql/__tests__',
			'packages/datastore/__tests__',
			'packages/datastore-storage-adapter/__tests__',
			'packages/interactions/__tests__',
			'packages/predictions/__tests__',
			'packages/pubsub/__tests__',
			...customClientDtsFiles,
		],
	},
	...fixupConfigRules(
		compat.extends(
			'eslint:recommended',
			'standard',
			'plugin:import/errors',
			'plugin:import/recommended',
			'plugin:import/typescript',
			'plugin:@typescript-eslint/stylistic',
			'plugin:@typescript-eslint/recommended',
			'plugin:prettier/recommended',
		),
	),
	{
		plugins: {
			'@stylistic': stylistic,
			'@typescript-eslint': fixupPluginRules(typescriptEslint),
			'unused-imports': unusedImports,
			import: fixupPluginRules(_import),
			jsdoc,
		},

		languageOptions: {
			globals: {
				...globals.node,
			},

			parser: tsParser,
			ecmaVersion: 5,
			sourceType: 'commonjs',

			parserOptions: {
				project: './tsconfig.json',
			},
		},

		settings: {
			'import/parsers': {
				'@typescript-eslint/parser': ['.ts', '.tsx'],
			},

			'import/resolver': {
				typescript: {
					alwaysTryTypes: true,
					project: ['packages/*/tsconfig.json', 'tsconfig.json'],
				},
			},

			'import/ignore': ['react-native'],
		},

		rules: {
			camelcase: [
				'error',
				{
					allow: [
						// exceptions for core package
						'phone_number',
						'search_indices',
						// exceptions for api packages
						'graphql_headers',
						// exceptions for the legacy config
						'^(aws_|amazon_)',
						'access_key',
						'secret_key',
						'session_token',
						// exceptions for the auth package
						'redirect_uri',
						'response_type',
						'client_id',
						'identity_provider',
						'code_challenge',
						'code_challenge_method',
						'grant_type',
						'code_verifier',
						'logout_uri',
						'id_token',
						'access_token',
						'refresh_token',
						'token_type',
						'expires_in',
						'error_description',
						'error_message',
						// exceptions for the notifications package
						'campaign_id',
						'delivery_type',
						'treatment_id',
						'campaign_activity_id',
						'journey_activity_id',
						'journey_run_id',
						'journey_id',
					],
				},
			],

			'import/no-deprecated': 'warn',
			'import/no-empty-named-blocks': 'error',
			'import/no-mutable-exports': 'error',
			'import/no-relative-packages': 'error',
			'import/newline-after-import': 'error',

			'import/order': [
				'error',
				{
					'newlines-between': 'always',
				},
			],

			'no-eval': 'error',
			'no-param-reassign': 'error',
			'no-shadow': 'off',
			'no-use-before-define': 'off',
			'no-useless-constructor': 'off',
			'no-unused-expressions': 'off',
			'no-trailing-spaces': 'error',
			'no-return-await': 'error',
			'n/no-callback-literal': 'off',
			'object-shorthand': 'error',
			'prefer-destructuring': 'off',

			'promise/catch-or-return': [
				'error',
				{
					terminationMethod: ['then', 'catch', 'asCallback', 'finally'],
				},
			],

			'sort-imports': [
				'error',
				{
					ignoreDeclarationSort: true,
				},
			],

			'unused-imports/no-unused-imports': 'error',

			'unused-imports/no-unused-vars': [
				'error',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_',
					caughtErrors: 'none',
				},
			],

			'valid-typeof': [
				'error',
				{
					requireStringLiterals: false,
				},
			],

			'@stylistic/comma-dangle': [
				'error',
				{
					arrays: 'always-multiline',
					objects: 'always-multiline',
					imports: 'always-multiline',
					exports: 'always-multiline',
					functions: 'always-multiline',
					enums: 'always-multiline',
					generics: 'always-multiline',
					tuples: 'always-multiline',
				},
			],

			'@stylistic/function-call-argument-newline': ['error', 'consistent'],
			'@stylistic/indent': 'off',

			'@stylistic/max-len': [
				'error',
				{
					code: 120,
					ignoreComments: true,
					ignoreUrls: true,
					ignoreStrings: true,
					ignoreTemplateLiterals: true,
					ignoreRegExpLiterals: true,
				},
			],

			'@stylistic/padding-line-between-statements': [
				'error',
				{
					blankLine: 'always',
					prev: '*',
					next: 'return',
				},
			],

			'@stylistic/space-before-function-paren': [
				'error',
				{
					anonymous: 'never',
					named: 'never',
					asyncArrow: 'always',
				},
			],

			'@typescript-eslint/method-signature-style': ['error', 'method'],
			'@typescript-eslint/no-confusing-void-expression': 'error',
			'@typescript-eslint/no-explicit-any': 'off',

			'@typescript-eslint/no-namespace': [
				'error',
				{
					allowDeclarations: true,
				},
			],

			'@typescript-eslint/no-shadow': 'error',
			'@typescript-eslint/no-var-requires': 'off',
			'@typescript-eslint/no-unused-vars': 'off',

			'@typescript-eslint/no-unused-expressions': [
				'error',
				{
					allowShortCircuit: true,
					allowTernary: true,
				},
			],

			'@typescript-eslint/no-use-before-define': [
				'error',
				{
					functions: false,
					variables: false,
					classes: false,
				},
			],

			'@typescript-eslint/no-useless-constructor': 'error',
			'@typescript-eslint/no-require-imports': 'off',

			'@typescript-eslint/prefer-destructuring': [
				'error',
				{
					object: true,
					array: false,
				},
			],

			'jsdoc/no-undefined-types': 1,
		},
	},
	{
		ignores: [
			'**/**.{native,android,ios}.**',
			'**/packages/react-native/example/**',
		],
		rules: {
			'import/no-extraneous-dependencies': 'error',
		},
	},
];
