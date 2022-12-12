'use strict';

import { jitteredExponentialRetry, NonRetryableError } from '../src/Util';
import ReachabilityNative from '../src/Util/Reachability.native';
import Reachability from '../src/Util/Reachability';
import { ConsoleLogger as Logger } from '../src/Logger';
import { urlSafeDecode, urlSafeEncode } from '../src/Util/StringUtils';
import { DateUtils } from '../src/Util/DateUtils';
import {
	createCognitoIdentityClient,
	middlewareArgs,
} from '../src/Util/CognitoIdentityClient';
import { BuildMiddleware, HttpRequest } from '@aws-sdk/types';
import {
	GetCredentialsForIdentityCommand,
	GetIdCommand,
} from '@aws-sdk/client-cognito-identity';

Logger.LOG_LEVEL = 'DEBUG';

describe('Util', () => {
	beforeEach(() => {});

	describe('DateUtils', () => {
		test('isClockSkewError', () => {
			expect(
				DateUtils.isClockSkewError({
					response: {
						headers: {
							'x-amzn-errortype': 'BadRequestException',
							date: true,
						},
					},
				})
			).toBeTruthy();
		});

		test('', () => {
			DateUtils.setClockOffset(1000);
			expect(DateUtils.getClockOffset()).toBe(1000);
			DateUtils.setClockOffset(0);
			const date = new Date();
			const header = DateUtils.getHeaderStringFromDate(date);
			const fromHeader = DateUtils.getDateFromHeaderString(header);
			expect(date.toTimeString()).toEqual(fromHeader.toTimeString());
		});
	});

	describe('StringUtils', () => {
		test('urlSafeEncode', () => {
			expect(urlSafeEncode('some/path?to-whatever')).toBe(
				'736f6d652f706174683f746f2d7768617465766572'
			);
		});

		test('urlSafeDecode', () => {
			expect(urlSafeDecode('736f6d652f706174683f746f2d7768617465766572')).toBe(
				'some/path?to-whatever'
			);
		});
	});

	describe('cognito identity client test', () => {
		test('client should be instantiated', async () => {
			const cognitoClient = createCognitoIdentityClient({
				region: 'us-west-1',
			});
			expect(cognitoClient).toBeTruthy();
		});

		test('middlewareArgs helper should merge headers into request object', async () => {
			const args = middlewareArgs({
				request: {
					headers: {
						'test-header': '1234',
					},
				},
				input: {},
			});
			expect(args.request.headers['test-header']).toEqual('1234');
			expect(args.request.headers['cache-control']).toEqual('no-store');
		});

		test('headers should be added by middleware on GetIdCommand', async () => {
			const requestCacheHeaderValidator: BuildMiddleware<any, any> =
				next => async args => {
					// middleware intercept the request and return it early
					const request = args.request as HttpRequest;
					const { headers } = request;
					expect(headers['cache-control']).toEqual('no-store');
					return { output: {} as any, response: {} as any };
				};

			const client = createCognitoIdentityClient({ region: 'us-west-1' });
			client.middlewareStack.addRelativeTo(requestCacheHeaderValidator, {
				relation: 'after',
				toMiddleware: 'cacheControlMiddleWare',
			});

			await client.send(
				new GetIdCommand({
					IdentityPoolId: 'us-west-1:12345678-1234-1234-1234-123456789000',
				})
			);
			expect.assertions(1);
		});

		test('headers should be added by middleware on GetCredentialsForIdentityCommand', async () => {
			const requestCacheHeaderValidator: BuildMiddleware<any, any> =
				next => async args => {
					// middleware intercept the request and return it early
					const request = args.request as HttpRequest;
					const { headers } = request;
					expect(headers['cache-control']).toEqual('no-store');
					return { output: {} as any, response: {} as any };
				};

			const client = createCognitoIdentityClient({ region: 'us-west-1' });
			client.middlewareStack.addRelativeTo(requestCacheHeaderValidator, {
				relation: 'after',
				toMiddleware: 'cacheControlMiddleWare',
			});
			await client.send(
				new GetCredentialsForIdentityCommand({
					IdentityId: '1234',
					Logins: {},
				})
			);

			expect.assertions(1);
		});
	});

	test('jitteredExponential retry happy case', async () => {
		const resolveAt = 3;
		let attempts = 0;
		function createRetryableFunction() {
			return async () => {
				if (attempts >= resolveAt) {
					return 'done';
				} else {
					attempts++;
					throw new Error('Expected failure');
				}
			};
		}

		const retryableFunction = createRetryableFunction();

		try {
			await jitteredExponentialRetry(retryableFunction, []);
			expect(attempts).toEqual(3);
		} catch (err) {
			expect(true).toBe(false);
		}
	});
	test('Fail with NonRetryableError', async () => {
		const nonRetryableError = new NonRetryableError('fatal');
		const testFunc = jest.fn(() => {
			throw nonRetryableError;
		});
		expect.assertions(2);
		try {
			await jitteredExponentialRetry(testFunc, []);
		} catch (err) {
			expect(err).toBe(nonRetryableError);
		}

		expect(testFunc).toBeCalledTimes(1);
	});
	test('Should throw an Error when NetInfo is not passed to networkMonitor in React Native Reachability', () => {
		const subscribe = netInfo => {
			new ReachabilityNative().networkMonitor(netInfo);
		};

		function subscribeWithNetInfo() {
			// Pass an object that has a fetch attribute (imitate NetInfo)
			subscribe({ addEventListener: {} });
		}

		expect(subscribe).toThrowError(
			'NetInfo must be passed to networkMonitor to enable reachability in React Native'
		);
		expect(subscribeWithNetInfo).not.toThrowError();
	});
	test('Should not throw an Error when NetInfo is not passed to networkMonitor in Web Reachability', () => {
		const subscribe = () => {
			new Reachability().networkMonitor();
		};

		expect(subscribe).not.toThrowError();
	});
});
