import { Observable, Observer } from 'rxjs';
import { Reachability } from '@aws-amplify/core/internals/utils';
import { ConsoleLogger } from '@aws-amplify/core';
import { MESSAGE_TYPES } from '../src/Providers/constants';
import * as constants from '../src/Providers/constants';

import { delay, FakeWebSocketInterface } from './helpers';
import { ConnectionState as CS } from '../src/types/PubSub';

import { AWSAppSyncEventProvider } from '../src/Providers/AWSAppSyncEventsProvider';

// Mock all calls to signRequest
jest.mock('@aws-amplify/core/internals/aws-client-utils', () => {
	const original = jest.requireActual(
		'@aws-amplify/core/internals/aws-client-utils',
	);
	return {
		...original,
		signRequest: (_request: any, _options: any) => {
			return {
				method: 'test',
				headers: { test: 'test' },
				url: new URL('http://example/'),
			};
		},
	};
});

// Mock all calls to signRequest
jest.mock('@aws-amplify/core', () => {
	const original = jest.requireActual('@aws-amplify/core');
	const session = {
		tokens: {
			accessToken: {
				toString: () => 'test',
			},
		},
		credentials: {
			accessKeyId: 'test',
			secretAccessKey: 'test',
		},
	};
	return {
		...original,
		fetchAuthSession: (_request: any, _options: any) => {
			return Promise.resolve(session);
		},
		Amplify: {
			Auth: {
				fetchAuthSession: async () => session,
			},
		},
		browserOrNode() {
			return {
				isBrowser: true,
				isNode: false,
			};
		},
	};
});

describe('AppSyncEventProvider', () => {
	describe('subscribe()', () => {
		describe('returned observer', () => {
			describe('connection logic with mocked websocket', () => {
				let fakeWebSocketInterface: FakeWebSocketInterface;
				const loggerSpy: jest.SpyInstance = jest.spyOn(
					ConsoleLogger.prototype,
					'_log',
				);

				let provider: AWSAppSyncEventProvider;
				let reachabilityObserver: Observer<{ online: boolean }>;

				beforeEach(async () => {
					// Set the network to "online" for these tests
					jest
						.spyOn(Reachability.prototype, 'networkMonitor')
						.mockImplementationOnce(() => {
							return new Observable(observer => {
								reachabilityObserver = observer;
							});
						})
						// Twice because we subscribe to get the initial state then again to monitor reachability
						.mockImplementationOnce(() => {
							return new Observable(observer => {
								reachabilityObserver = observer;
							});
						});

					fakeWebSocketInterface = new FakeWebSocketInterface();
					provider = new AWSAppSyncEventProvider();

					// Saving this spy and resetting it by hand causes badness
					//     Saving it causes new websockets to be reachable across past tests that have not fully closed
					//     Resetting it proactively causes those same past tests to be dealing with null while they reach a settled state
					jest
						.spyOn(provider as any, '_getNewWebSocket')
						.mockImplementation(() => {
							fakeWebSocketInterface.newWebSocket();
							return fakeWebSocketInterface.webSocket as WebSocket;
						});

					// Reduce retry delay for tests to 100ms
					Object.defineProperty(constants, 'MAX_DELAY_MS', {
						value: 100,
					});
					// Reduce retry delay for tests to 100ms
					Object.defineProperty(constants, 'RECONNECT_DELAY', {
						value: 100,
					});
				});

				afterEach(async () => {
					provider?.close();
					await fakeWebSocketInterface?.closeInterface();
					fakeWebSocketInterface?.teardown();
					loggerSpy.mockClear();
				});

				test('subscription observer error is triggered when a connection is formed and a non-retriable connection_error data message is received', async () => {
					expect.assertions(3);

					const socketCloseSpy = jest.spyOn(
						fakeWebSocketInterface.webSocket,
						'close',
					);
					fakeWebSocketInterface.webSocket.readyState = WebSocket.OPEN;

					const observer = provider.subscribe({
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					observer.subscribe({
						error: e => {
							expect(e.errors[0].message).toEqual(
								'Connection failed: UnauthorizedException',
							);
						},
					});

					await fakeWebSocketInterface?.readyForUse;
					await fakeWebSocketInterface?.triggerOpen();

					// Resolve the message delivery actions
					await Promise.resolve(
						fakeWebSocketInterface?.sendDataMessage({
							type: MESSAGE_TYPES.GQL_CONNECTION_ERROR,
							errors: [
								{
									errorType: 'UnauthorizedException', // - non-retriable
									errorCode: 401,
								},
							],
						}),
					);

					// Watching for raised exception to be caught and logged
					expect(loggerSpy).toHaveBeenCalledWith(
						'DEBUG',
						expect.stringContaining('error on bound '),
						expect.objectContaining({
							message: expect.stringMatching('UnauthorizedException'),
						}),
					);

					await delay(1);

					expect(socketCloseSpy).toHaveBeenCalledWith(3001);
				});

				test('subscription observer error is not triggered when a connection is formed and a retriable connection_error data message is received', async () => {
					expect.assertions(2);

					const observer = provider.subscribe({
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					observer.subscribe({
						error: x => {},
					});

					const openSocketAttempt = async () => {
						await fakeWebSocketInterface?.readyForUse;
						await fakeWebSocketInterface?.triggerOpen();

						// Resolve the message delivery actions
						await Promise.resolve(
							fakeWebSocketInterface?.sendDataMessage({
								type: MESSAGE_TYPES.GQL_CONNECTION_ERROR,
								errors: [
									{
										errorType: 'Retriable Test',
										errorCode: 408, // Request timed out - retriable
									},
								],
							}),
						);
						await fakeWebSocketInterface?.resetWebsocket();
					};

					// Go through two connection attempts to excercise backoff and retriable raise
					await openSocketAttempt();
					await openSocketAttempt();

					// Watching for raised exception to be caught and logged
					expect(loggerSpy).toHaveBeenCalledWith(
						'DEBUG',
						expect.stringContaining('error on bound '),
						expect.objectContaining({
							message: expect.stringMatching('Retriable Test'),
						}),
					);

					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.ConnectionDisrupted,
					]);

					expect(loggerSpy).toHaveBeenCalledWith(
						'DEBUG',
						'Connection failed: Retriable Test',
					);
				});

				test('subscription observer is triggered when a connection is formed and a data message is received after connection ack', async () => {
					expect.assertions(1);
					const mockNext = jest.fn();

					const observer = provider.subscribe({
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					const event = JSON.stringify({ some: 'data' });

					observer.subscribe({
						// Succeed only when the first message comes through
						next: mockNext,
						// Closing a hot connection (for cleanup) makes it blow up the test stack
						error: () => {},
					});
					await fakeWebSocketInterface?.standardConnectionHandshake();
					await fakeWebSocketInterface?.startAckMessage({
						connectionTimeoutMs: 100,
					});
					await fakeWebSocketInterface?.sendDataMessage({
						id: fakeWebSocketInterface?.webSocket.subscriptionId,
						type: MESSAGE_TYPES.DATA,
						event,
					});

					// events callback returns entire message contents
					expect(mockNext).toHaveBeenCalledWith({
						id: fakeWebSocketInterface?.webSocket.subscriptionId,
						type: MESSAGE_TYPES.DATA,
						event: JSON.parse(event),
					});
				});

				test('socket is disconnected after .close() is called', async () => {
					expect.assertions(2);
					const mockNext = jest.fn();

					const observer = provider.subscribe({
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					const event = JSON.stringify({ some: 'data' });

					observer.subscribe({
						next: mockNext,
						error: () => {},
					});

					await fakeWebSocketInterface?.standardConnectionHandshake();
					await fakeWebSocketInterface?.startAckMessage({
						connectionTimeoutMs: 100,
					});
					await fakeWebSocketInterface?.sendDataMessage({
						id: fakeWebSocketInterface?.webSocket.subscriptionId,
						type: MESSAGE_TYPES.DATA,
						event,
					});

					// events callback returns entire message contents
					expect(mockNext).toHaveBeenCalledWith({
						id: fakeWebSocketInterface?.webSocket.subscriptionId,
						type: MESSAGE_TYPES.DATA,
						event: JSON.parse(event),
					});

					await provider.close();

					expect(fakeWebSocketInterface.hasClosed).resolves.toBeUndefined();
				});
			});
		});
	});
	describe('publish', () => {
		let fakeWebSocketInterface: FakeWebSocketInterface;
		const loggerSpy: jest.SpyInstance = jest.spyOn(
			ConsoleLogger.prototype,
			'_log',
		);
		let provider: AWSAppSyncEventProvider;
		let reachabilityObserver: Observer<{ online: boolean }>;

		beforeEach(async () => {
			// Set the network to "online" for these tests
			jest
				.spyOn(Reachability.prototype, 'networkMonitor')
				.mockImplementationOnce(() => {
					return new Observable(observer => {
						reachabilityObserver = observer;
					});
				})
				// Twice because we subscribe to get the initial state then again to monitor reachability
				.mockImplementationOnce(() => {
					return new Observable(observer => {
						reachabilityObserver = observer;
					});
				});

			fakeWebSocketInterface = new FakeWebSocketInterface();
			provider = new AWSAppSyncEventProvider();
			Object.defineProperty(provider, 'socketStatus', {
				value: constants.SOCKET_STATUS.READY,
			});

			Object.defineProperty(provider, 'awsRealTimeSocket', {
				get: function () {
					fakeWebSocketInterface.newWebSocket();
					return fakeWebSocketInterface.webSocket;
				},
			});

			// Saving this spy and resetting it by hand causes badness
			//     Saving it causes new websockets to be reachable across past tests that have not fully closed
			//     Resetting it proactively causes those same past tests to be dealing with null while they reach a settled state

			// Set the addEventListener() to do nothing for the test
			jest
				.spyOn(fakeWebSocketInterface.webSocket, 'addEventListener')
				.mockImplementation(() => {});

			jest.spyOn(provider as any, '_getNewWebSocket').mockImplementation(() => {
				fakeWebSocketInterface.newWebSocket();
				return fakeWebSocketInterface.webSocket as WebSocket;
			});

			// Reduce retry delay for tests to 100ms
			Object.defineProperty(constants, 'MAX_DELAY_MS', {
				value: 100,
			});
			// Reduce retry delay for tests to 100ms
			Object.defineProperty(constants, 'RECONNECT_DELAY', {
				value: 100,
			});
		});

		afterEach(async () => {
			provider?.close();
			await fakeWebSocketInterface?.closeInterface();
			fakeWebSocketInterface?.teardown();
			loggerSpy.mockClear();
		});

		test('authenticating with AWS_IAM', async () => {
			expect.assertions(1);
			provider.publish({
				appSyncGraphqlEndpoint: 'ws://localhost:8080',
				query: 'events/test',
				variables: { some: 'data' },
				authenticationType: 'iam',
			});

			await fakeWebSocketInterface?.readyForUse;

			expect(loggerSpy).toHaveBeenCalledWith(
				'DEBUG',
				'Authenticating with "iam"',
			);
		});

		test('authenticating with API_KEY', async () => {
			expect.assertions(1);
			fakeWebSocketInterface.webSocket.readyState = WebSocket.OPEN;
			provider.publish({
				appSyncGraphqlEndpoint: 'ws://localhost:8080',
				query: 'events/test',
				variables: { some: 'data' },
				authenticationType: 'apiKey',
				apiKey: 'test',
			});

			await fakeWebSocketInterface?.readyForUse;

			expect(loggerSpy).toHaveBeenCalledWith(
				'DEBUG',
				'Authenticating with "apiKey"',
			);
		});

		test('authenticating with OPENID_CONNECT', async () => {
			expect.assertions(1);

			provider.publish({
				appSyncGraphqlEndpoint: 'ws://localhost:8080',
				query: 'events/test',
				variables: { some: 'data' },
				authenticationType: 'oidc',
			});

			await fakeWebSocketInterface?.readyForUse;

			expect(loggerSpy).toHaveBeenCalledWith(
				'DEBUG',
				'Authenticating with "oidc"',
			);
		});

		test('authenticating with AWS_LAMBDA/custom', async () => {
			expect.assertions(1);

			provider.publish({
				appSyncGraphqlEndpoint: 'ws://localhost:8080',
				query: 'events/test',
				variables: { some: 'data' },
				authenticationType: 'none',
				additionalHeaders: {
					Authorization: 'test',
				},
			});

			await fakeWebSocketInterface?.readyForUse;

			expect(loggerSpy).toHaveBeenCalledWith(
				'DEBUG',
				'Authenticating with "none"',
			);
		});

		test('authenticating with userPool / custom library options token', async () => {
			expect.assertions(1);

			provider.publish({
				appSyncGraphqlEndpoint: 'ws://localhost:8080',
				query: 'events/test',
				variables: { some: 'data' },
				authenticationType: 'userPool',
				/**
				 * When Amplify is configured with a `header` function
				 * that returns an `Authorization` token, the GraphQL
				 * API will pass this function as the `libraryConfigHeaders`
				 * option to the AWSAppSyncRealTimeProvider's `subscribe`
				 * function.
				 */
				libraryConfigHeaders: async () => ({
					Authorization: 'test',
				}),
			});

			await fakeWebSocketInterface?.readyForUse;

			expect(loggerSpy).toHaveBeenCalledWith(
				'DEBUG',
				'Authenticating with "userPool"',
			);
		});

		test('authenticating with AWS_LAMBDA/custom w/ custom header function', async () => {
			expect.assertions(1);

			provider.publish({
				appSyncGraphqlEndpoint: 'ws://localhost:8080',
				query: 'events/test',
				variables: { some: 'data' },
				authenticationType: 'none',
				additionalHeaders: async () => ({
					Authorization: 'test',
				}),
			});

			await fakeWebSocketInterface?.readyForUse;

			expect(loggerSpy).toBeCalledWith('DEBUG', 'Authenticating with "none"');
		});

		test('authenticating with AWS_LAMBDA/custom without Authorization', async () => {
			expect.assertions(1);

			await expect(
				provider.publish({
					appSyncGraphqlEndpoint: 'ws://localhost:8080',
					query: 'events/test',
					variables: { some: 'data' },
					authenticationType: 'none',
					additionalHeaders: {
						Authorization: '',
					},
				}),
			).rejects.toThrow('No auth token specified');
		});
	});
});
