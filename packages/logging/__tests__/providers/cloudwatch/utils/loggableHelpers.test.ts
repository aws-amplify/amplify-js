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

jest.mock('@aws-amplify/core', () => {
	return {
		...jest.requireActual('@aws-amplify/core'),
		fetchAuthSession: jest.fn().mockImplementation(() =>
			Promise.resolve({
				userSub: 'userSub1',
			}),
		),
	};
});
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
			expect(await isLoggable(authDebugLog, cloudWatchConfig)).toEqual(false);
			expect(resolveLoggingConstraintsSpy).toHaveBeenCalledTimes(0);
		});

		it('should call resolveLoggingConstraints with correct params if "loggingConstraints" is present', async () => {
			const cloudWatchConfig: CloudWatchConfig = {
				logGroupName: 'logGroupName',
				region: 'region',
				loggingConstraints: { defaultLogLevel: 'ERROR' },
			};
			expect(await isLoggable(authErrorLog, cloudWatchConfig)).toEqual(true);
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
				await resolveLoggingConstraints(authErrorLog, loggingConstraints),
			).toEqual('ERROR');
			expect(
				await resolveLoggingConstraints(storageInfoLog, loggingConstraints),
			).toEqual('ERROR');
			expect(
				await resolveLoggingConstraints(noCategoryDebugLog, loggingConstraints),
			).toEqual('ERROR');
		});

		it('should resolve "categoryLogLevel" correctly', async () => {
			const loggingConstraints: LoggingConstraints = {
				defaultLogLevel: 'ERROR',
				categoryLogLevel: { Auth: 'WARN', Storage: 'DEBUG' },
			};
			expect(
				await resolveLoggingConstraints(authErrorLog, loggingConstraints),
			).toEqual('WARN');
			expect(
				await resolveLoggingConstraints(storageInfoLog, loggingConstraints),
			).toEqual('DEBUG');
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
				await resolveLoggingConstraints(authErrorLog, loggingConstraints),
			).toEqual('WARN');
			expect(
				await resolveLoggingConstraints(storageInfoLog, loggingConstraints),
			).toEqual('ERROR');
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
				await resolveLoggingConstraints(authErrorLog, loggingConstraints),
			).toEqual('INFO');
			expect(
				await resolveLoggingConstraints(storageInfoLog, loggingConstraints),
			).toEqual('INFO');
			expect(
				await resolveLoggingConstraints(noCategoryDebugLog, loggingConstraints),
			).toEqual('INFO');
		});

		it('should resolve "categoryLogLevel" correctly when userLogLevel is presnet and user is found', async () => {
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
				await resolveLoggingConstraints(authErrorLog, loggingConstraints),
			).toEqual('DEBUG');
			expect(
				await resolveLoggingConstraints(storageInfoLog, loggingConstraints),
			).toEqual('NONE');
		});
	});
});
