import { getJestConfig } from '../../jest/getJestConfig.mjs';
import tsconfig from './tsconfig.json' assert { type: 'json' };

const jestConfig = getJestConfig(tsconfig.compilerOptions, {
	coverageThreshold: {
		global: {
			branches: 75,
			functions: 80,
			lines: 81,
			statements: 91,
		},
	},
});

export default jestConfig;
