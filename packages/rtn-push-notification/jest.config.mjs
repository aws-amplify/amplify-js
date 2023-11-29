import { getJestConfig } from '../../jest/getJestConfig.mjs';
import tsconfig from './tsconfig.json' assert { type: 'json' };

const jestConfig = getJestConfig(tsconfig.compilerOptions, {
	coverageThreshold: {
		global: {
			branches: 94,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},
});

export default jestConfig;
