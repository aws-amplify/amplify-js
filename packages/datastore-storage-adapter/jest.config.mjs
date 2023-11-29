import { getJestConfig } from '../../jest/getJestConfig.mjs';
import tsconfig from './tsconfig.json' assert { type: 'json' };

const jestConfig = getJestConfig(tsconfig.compilerOptions, {
	coverageThreshold: {
		global: {
			branches: 82,
			functions: 97,
			lines: 88,
			statements: 88,
		},
	},
});

export default jestConfig;
