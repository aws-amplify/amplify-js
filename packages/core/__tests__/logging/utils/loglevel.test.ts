import { checkLogLevel } from '../../../src/logging/utils';
import { LogLevel } from '../../../src/logging/types';

const levelVerbose: [LogLevel, LogLevel, boolean][] = [
	['VERBOSE', 'VERBOSE', true],
	['DEBUG', 'VERBOSE', true],
	['INFO', 'VERBOSE', true],
	['WARN', 'VERBOSE', true],
	['ERROR', 'VERBOSE', true],
];
const levelDebug: [LogLevel, LogLevel, boolean][] = [
	['VERBOSE', 'DEBUG', false],
	['DEBUG', 'DEBUG', true],
	['INFO', 'DEBUG', true],
	['WARN', 'DEBUG', true],
	['ERROR', 'DEBUG', true],
];
const levelInfo: [LogLevel, LogLevel, boolean][] = [
	['VERBOSE', 'INFO', false],
	['DEBUG', 'INFO', false],
	['INFO', 'INFO', true],
	['WARN', 'INFO', true],
	['ERROR', 'INFO', true],
];
const levelWarn: [LogLevel, LogLevel, boolean][] = [
	['VERBOSE', 'WARN', false],
	['DEBUG', 'WARN', false],
	['INFO', 'WARN', false],
	['WARN', 'WARN', true],
	['ERROR', 'WARN', true],
];
const levelError: [LogLevel, LogLevel, boolean][] = [
	['VERBOSE', 'ERROR', false],
	['DEBUG', 'ERROR', false],
	['INFO', 'ERROR', false],
	['WARN', 'ERROR', false],
	['ERROR', 'ERROR', true],
];
const levelNone: [LogLevel, LogLevel, boolean][] = [
	['VERBOSE', 'NONE', false],
	['DEBUG', 'NONE', false],
	['INFO', 'NONE', false],
	['WARN', 'NONE', false],
	['ERROR', 'NONE', false],
];

describe('logging utils', () => {
	it.each([
		...levelVerbose,
		...levelDebug,
		...levelInfo,
		...levelWarn,
		...levelError,
		...levelNone,
	])(
		'can user log %p log event if current level is %p',
		(inputLevel, currentLevel, result) => {
			expect(checkLogLevel(inputLevel, currentLevel)).toBe(result);
		}
	);
});
