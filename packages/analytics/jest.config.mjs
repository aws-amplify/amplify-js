import { getJestConfig } from '../../jest/getJestConfig.mjs';
import { requireResolve } from '../../jest/requireResolve.mjs';
import tsconfig from './tsconfig.json' assert { type: 'json' };

const jestConfig = getJestConfig(tsconfig.compilerOptions, {
	coverageThreshold: {
		global: {
			branches: 42,
			functions: 58,
			lines: 65,
			statements: 68,
		},
	},
	moduleNameMapper: {
		uuid: requireResolve('uuid'),
	},
});

export default jestConfig;
