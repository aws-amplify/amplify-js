import { getJestConfig } from '../../jest/getJestConfig.mjs';
import { requireResolve } from '../../jest/requireResolve.mjs';
import tsconfig from './tsconfig.json' assert { type: 'json' };

const jestConfig = getJestConfig(tsconfig.compilerOptions, {
	coverageThreshold: {
		global: {
			branches: 64,
			functions: 86,
			lines: 89,
			statements: 89,
		},
	},
	moduleNameMapper: {
		uuid: requireResolve('uuid'),
	},
});

export default jestConfig;
