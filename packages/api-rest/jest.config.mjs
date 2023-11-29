import { getJestConfig } from '../../jest/getJestConfig.mjs';
import tsconfig from './tsconfig.json' assert { type: 'json' };

const jestConfig = getJestConfig(tsconfig.compilerOptions, {
	coverageThreshold: {
		global: {
			branches: 82,
			functions: 89,
			lines: 94,
			statements: 95,
		},
	},
});

export default jestConfig;
