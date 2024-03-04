// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	isLoggable,
	resolveLoggingConstraints,
} from '../../../../src/providers/cloudwatch/utils/loggableHelpers';
import * as loggableHelpers from '../../../../src/providers/cloudwatch/utils/loggableHelpers';

import {
	CloudWatchConfig,
	LoggingConstraints,
} from '../../../../src/providers/cloudwatch/types';
import { LogParams } from '@aws-amplify/core/internals/utils';

jest.mock('@aws-amplify/core', () => ({
	fetchAuthSession: jest.fn(() => Promise.resolve({ userSub: 'userSub1' })),
}));

const baseLog = {
	message: 'message',
	namespace: 'namespace',
};
const authErrorLog: LogParams = {
	...baseLog,
	logLevel: 'ERROR',
	category: 'Auth',
};
const storageInfoLog: LogParams = {
	...baseLog,
	logLevel: 'INFO',
	category: 'Storage',
};
const noCategoryDebugLog: LogParams = {
	...baseLog,
	logLevel: 'DEBUG',
};

describe('resolve loggingConstraints in cloudwatch config', () => {
	describe('isLoggable', () => {
		let resolveLoggingConstraintsSpy: jest.SpyInstance;
		beforeEach(() => {
			resolveLoggingConstraintsSpy = jest.spyOn(
				loggableHelpers,
				'resolveLoggingConstraints',
			);
		});
		afterEach(() => {
			resolveLoggingConstraintsSpy.mockRestore();
		});

		it('should default to "INFO" logLevel if "loggingConstraints" is not present', async () => {
			const cloudWatchConfig: CloudWatchConfig = {
				logGroupName: 'logGroupName',
				region: 'region',
			};
			const authDebugLog: LogParams = { ...authErrorLog, logLevel: 'DEBUG' };

			// cloudWatchConfig has no loggingConstraints, defaults to 'INFO'
			expect(isLoggable(authDebugLog, cloudWatchConfig)).resolves.toBe(false);
			expect(resolveLoggingConstraintsSpy).toHaveBeenCalledTimes(0);
		});

		it('should call resolveLoggingConstraints with correct params if "loggingConstraints" is present', async () => {
			const cloudWatchConfig: CloudWatchConfig = {
				logGroupName: 'logGroupName',
				region: 'region',
				loggingConstraints: { defaultLogLevel: 'ERROR' },
			};
			expect(isLoggable(authErrorLog, cloudWatchConfig)).resolves.toBe(true);
			expect(resolveLoggingConstraintsSpy).toHaveBeenCalledTimes(1);
			expect(resolveLoggingConstraintsSpy).toHaveBeenCalledWith(
				authErrorLog,
				cloudWatchConfig.loggingConstraints,
			);
		});
	});

	describe('resolveLoggingConstraints', () => {
		it('should resolve "defaultLogLevel" correctly', async () => {
			const loggingConstraints: LoggingConstraints = {
				defaultLogLevel: 'ERROR',
			};
			expect(
				resolveLoggingConstraints(authErrorLog, loggingConstraints),
			).resolves.toBe('ERROR');
			expect(
				resolveLoggingConstraints(storageInfoLog, loggingConstraints),
			).resolves.toBe('ERROR');
			expect(
				resolveLoggingConstraints(noCategoryDebugLog, loggingConstraints),
			).resolves.toBe('ERROR');
		});

		it('should resolve "categoryLogLevel" correctly', async () => {
			const loggingConstraints: LoggingConstraints = {
				defaultLogLevel: 'ERROR',
				categoryLogLevel: { Auth: 'WARN', Storage: 'DEBUG' },
			};
			expect(
				resolveLoggingConstraints(authErrorLog, loggingConstraints),
			).resolves.toBe('WARN');
			expect(
				resolveLoggingConstraints(storageInfoLog, loggingConstraints),
			).resolves.toBe('DEBUG');
		});

		it('should resolve "categoryLogLevel" and "defaultLogLevel" correctly when userLogLevel is present but user is not found', async () => {
			const loggingConstraints: LoggingConstraints = {
				defaultLogLevel: 'ERROR',
				categoryLogLevel: { Auth: 'WARN' },
				userLogLevel: {
					userSub2: {
						defaultLogLevel: 'INFO',
						categoryLogLevel: { Auth: 'NONE', Storage: 'NONE' },
					},
				},
			};
			expect(
				resolveLoggingConstraints(authErrorLog, loggingConstraints),
			).resolves.toBe('WARN');
			expect(
				resolveLoggingConstraints(storageInfoLog, loggingConstraints),
			).resolves.toBe('ERROR');
		});

		it('should resolve "defaultLogLevel" correctly when userLogLevel is present and user is found', async () => {
			const loggingConstraints: LoggingConstraints = {
				defaultLogLevel: 'ERROR',
				categoryLogLevel: { Auth: 'WARN' },
				userLogLevel: {
					userSub1: { defaultLogLevel: 'INFO' },
					userSub2: { defaultLogLevel: 'VERBOSE' },
				},
			};
			expect(
				resolveLoggingConstraints(authErrorLog, loggingConstraints),
			).resolves.toBe('INFO');
			expect(
				resolveLoggingConstraints(storageInfoLog, loggingConstraints),
			).resolves.toBe('INFO');
			expect(
				resolveLoggingConstraints(noCategoryDebugLog, loggingConstraints),
			).resolves.toBe('INFO');
		});

		it('should resolve "categoryLogLevel" correctly when userLogLevel is present and user is found', async () => {
			const loggingConstraints: LoggingConstraints = {
				defaultLogLevel: 'ERROR',
				categoryLogLevel: { Auth: 'WARN' },
				userLogLevel: {
					userSub1: {
						defaultLogLevel: 'INFO',
						categoryLogLevel: { Auth: 'DEBUG', Storage: 'NONE' },
					},
					userSub2: {
						defaultLogLevel: 'VERBOSE',
						categoryLogLevel: { Auth: 'NONE', Storage: 'VERBOSE' },
					},
				},
			};
			expect(
				resolveLoggingConstraints(authErrorLog, loggingConstraints),
			).resolves.toBe('DEBUG');
			expect(
				resolveLoggingConstraints(storageInfoLog, loggingConstraints),
			).resolves.toBe('NONE');
		});
	});
});
