import { getJestConfig } from '../../jest/getJestConfig.mjs';
import tsconfig from './tsconfig.json' assert { type: 'json' };

const jestConfig = getJestConfig(tsconfig.compilerOptions, {
	coverageThreshold: {
		global: {
			branches: 64,
			functions: 74,
			lines: 83,
			statements: 83,
		},
	},
});

export default jestConfig;
