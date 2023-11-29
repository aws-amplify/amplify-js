import { getJestConfig } from '../../jest/getJestConfig.mjs';
import { requireResolve } from '../../jest/requireResolve.mjs';
import tsconfig from './tsconfig.json' assert { type: 'json' };

const jestConfig = getJestConfig(tsconfig.compilerOptions, {
	coverageThreshold: {
		global: {
			branches: 85,
			functions: 44,
			lines: 90,
			statements: 91,
		},
	},
	moduleNameMapper: {
		uuid: requireResolve('uuid'),
	},
});

export default jestConfig;
