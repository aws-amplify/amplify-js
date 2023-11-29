import { getJestConfig } from '../../jest/getJestConfig.mjs';
import { requireResolve } from '../../jest/requireResolve.mjs';
import tsconfig from './tsconfig.json' assert { type: 'json' };

const jestConfig = getJestConfig(tsconfig.compilerOptions, {
	moduleNameMapper: {
		'^dexie$': requireResolve('dexie'),
	},
	coverageThreshold: {
		global: {
			branches: 82,
			functions: 94,
			lines: 89,
			statements: 89,
		},
	},
});

export default jestConfig;
