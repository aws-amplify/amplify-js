import { getJestConfig } from '../../jest/getJestConfig.mjs';
import { requireResolve } from '../../jest/requireResolve.mjs';
import tsconfig from './tsconfig.json' assert { type: 'json' };

const jestConfig = getJestConfig(tsconfig.compilerOptions, {
	coverageThreshold: {
		global: {
			branches: 78,
			functions: 94,
			lines: 96,
			statements: 96,
		},
	},
	moduleNameMapper: {
		uuid: requireResolve('uuid'),
	},
});

export default jestConfig;
