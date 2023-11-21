import { getJestConfig } from '../../jest/getJestConfig.mjs';
import tsconfig from './tsconfig.test.json' assert { type: 'json' };

const jestConfig = getJestConfig(tsconfig.compilerOptions, {
	coverageThreshold: {
		global: {
			branches: 61,
			functions: 71,
			lines: 65,
			statements: 65,
		},
	},
	moduleNameMapper: {
		'/^~/(.*)$/': '<rootDir>/$1',
	},
});

export default jestConfig;
