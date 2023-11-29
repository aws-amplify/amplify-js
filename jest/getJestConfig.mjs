import typescript from 'typescript';
import * as tsJest from 'ts-jest';
import deepmerge from 'deepmerge';

/**
 * Creates a jest config object by merging typescript compiler options and jest config object into the base jest config.
 *
 * @param {typescript.CompilerOptions} tsCompilerOptions The compiler options of `tsconfig`.
 * @param {tsJest.JestConfigWithTsJest?} jestConfig The jest config to be merged into the base jest config.
 * @return {tsJest.JestConfigWithTsJest} The jest config object.
 */
export const getJestConfig = (tsCompilerOptions, jestConfig = {}) =>
	deepmerge(
		{
			workerIdleMemoryLimit: '512MB',
			coveragePathIgnorePatterns: ['/node_modules/', 'dist', '__tests__'],
			setupFiles: ['../../jest.setup.js'],
			testEnvironment: 'jsdom',
			testRegex: '/__tests__/.*\\.(test|spec)\\.[jt]sx?$',
			transform: {
				'^.+\\.(js|jsx|ts|tsx)$': [
					'ts-jest',
					{
						tsconfig: 'tsconfig.test.json',
					},
				],
			},
			moduleNameMapper: tsJest.pathsToModuleNameMapper(
				tsCompilerOptions.paths,
				{
					prefix: '<rootDir>/',
				},
			),
		},
		jestConfig,
	);
