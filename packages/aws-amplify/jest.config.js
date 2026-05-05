const { testRegex: _ignoreBaseTestRegex, ...baseConfig } = require('../../jest.config');

const baseProjectConfig = {
	...baseConfig,
	moduleNameMapper: {
		uuid: require.resolve('uuid'),
	},
	coveragePathIgnorePatterns: [
		...(baseConfig.coveragePathIgnorePatterns ?? []),
		'src/adapter-core/index.ts',
		'src/utils/index.ts',
	],
	// Keep ts-jest for everything else, but route `.mjs` through babel-jest
	// with preset-env targeting CommonJS. ts-jest in its current CJS mode
	// (required by the rest of this Jest setup) does not claim `.mjs`
	// files, so they would otherwise pass through untransformed and break
	// when Jest's CJS loader encounters native ESM `export` syntax in
	// `@aws-amplify/storage/dist/esm/*.mjs`.
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': baseConfig.transform['^.+\\.(js|jsx|ts|tsx)$'],
		'^.+\\.mjs$': [
			'babel-jest',
			{
				presets: [
					[
						'@babel/preset-env',
						{ targets: { node: 'current' }, modules: 'commonjs' },
					],
				],
				babelrc: false,
				configFile: false,
			},
		],
	},
	// By default Jest does not transform anything under `node_modules`.
	// `@aws-amplify/storage` is a yarn-workspace sibling, symlinked into
	// `node_modules/@aws-amplify/storage`, and its `dist/esm/*.mjs` output
	// is raw ESM — so we explicitly opt it in to transformation.
	transformIgnorePatterns: [
		'/node_modules/(?!@aws-amplify/storage/)',
		'\\.pnp\\.[^\\\\\\/]+$',
	],
};

module.exports = {
	coverageThreshold: {
		global: {
			branches: 85,
			functions: 65.5,
			lines: 90,
			statements: 91,
		},
	},
	projects: [
		{
			...baseProjectConfig,
			displayName: 'node',
			// Existing behavior: Node / SSR resolution of dependencies.
			// The narrow server-side surface of `@aws-amplify/storage` is
			// asserted here via `exports.test.ts`.
			testEnvironmentOptions: {
				customExportConditions: ['node'],
			},
			testMatch: ['<rootDir>/__tests__/**/*.(test|spec).[jt]s?(x)'],
			testPathIgnorePatterns: [
				'/node_modules/',
				'\\.browser\\.(test|spec)\\.[jt]sx?$',
			],
		},
		{
			...baseProjectConfig,
			displayName: 'browser',
			// Browser / client resolution: Jest+jsdom's default conditions
			// (`['browser', 'development']`) resolve `@aws-amplify/storage`
			// to its ESM browser bundle. Asserted via
			// `exports.browser.test.ts` which checks the full client surface.
			testMatch: [
				'<rootDir>/__tests__/**/*.browser.(test|spec).[jt]s?(x)',
			],
		},
	],
};
