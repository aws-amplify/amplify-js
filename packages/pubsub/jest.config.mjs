import { getJestConfig } from '../../jest/getJestConfig.mjs';
import { requireResolve } from '../../jest/requireResolve.mjs';
import tsconfig from './tsconfig.json' assert { type: 'json' };

const jestConfig = getJestConfig(tsconfig.compilerOptions, {
	coverageThreshold: {
		global: {
			branches: 12,
			functions: 41,
			lines: 28,
			statements: 28,
		},
	},
	moduleNameMapper: {
		uuid: requireResolve('uuid'),
	},
});

export default jestConfig;
