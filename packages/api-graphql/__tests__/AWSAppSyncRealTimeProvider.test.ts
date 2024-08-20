import { Observable, Observer } from 'rxjs';
import { Reachability } from '@aws-amplify/core/internals/utils';
import { ConsoleLogger } from '@aws-amplify/core';
import { MESSAGE_TYPES } from '../src/Providers/constants';
import * as constants from '../src/Providers/constants';

import {
	delay,
	FakeWebSocketInterface,
	replaceConstant,
} from '../__tests__/helpers';
import { ConnectionState as CS } from '../src/types/PubSub';

import { AWSAppSyncRealTimeProvider } from '../src/Providers/AWSAppSyncRealTimeProvider';

// Mock all calls to signRequest
jest.mock('@aws-amplify/core/internals/aws-client-utils', () => {
	const original = jest.requireActual(
		'@aws-amplify/core/internals/aws-client-utils',
	);
	return {
		...original,
		signRequest: (_request, _options) => {
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
		fetchAuthSession: (_request, _options) => {
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

describe('AWSAppSyncRealTimeProvider', () => {
	describe('isCustomDomain()', () => {
		test('Custom domain returns `true`', () => {
			const provider = new AWSAppSyncRealTimeProvider();
			const result = (provider as any).isCustomDomain(
				'https://unit-test.testurl.com/graphql',
			);
			expect(result).toBe(true);
		});

		test('Non-custom domain returns `false`', () => {
			const provider = new AWSAppSyncRealTimeProvider();
			const result = (provider as any).isCustomDomain(
				'https://12345678901234567890123456.appsync-api.us-west-2.amazonaws.com/graphql',
			);
			expect(result).toBe(false);
		});

		test('Non-custom domain in the amazonaws.com.cn subdomain space returns `false`', () => {
			const provider = new AWSAppSyncRealTimeProvider();
			const result = (provider as any).isCustomDomain(
				'https://12345678901234567890123456.appsync-api.cn-north-1.amazonaws.com.cn/graphql',
			);
			expect(result).toBe(false);
		});
	});

	describe('getProviderName()', () => {
		test('returns the provider name', () => {
			const provider = new AWSAppSyncRealTimeProvider();
			expect(provider.getProviderName()).toEqual('AWSAppSyncRealTimeProvider');
		});
	});

	describe('subscribe()', () => {
		test('returns an observable', () => {
			const provider = new AWSAppSyncRealTimeProvider();
			expect(provider.subscribe({})).toBeInstanceOf(Observable);
		});

		describe('returned observer', () => {
			describe('connection logic with mocked websocket', () => {
				let fakeWebSocketInterface: FakeWebSocketInterface;
				const loggerSpy: jest.SpyInstance = jest.spyOn(
					ConsoleLogger.prototype,
					'_log',
				);

				let provider: AWSAppSyncRealTimeProvider;
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
					provider = new AWSAppSyncRealTimeProvider();

					// Saving this spy and resetting it by hand causes badness
					//     Saving it causes new websockets to be reachable across past tests that have not fully closed
					//     Resetting it proactively causes those same past tests to be dealing with null while they reach a settled state
					jest.spyOn(provider, 'getNewWebSocket').mockImplementation(() => {
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

				test('standard subscription / unsubscription steps through the expected connection states', async () => {
					const observer = provider.subscribe({
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					const subscription = observer.subscribe({
						next: () => {},
						error: x => {},
					});

					// Wait for the socket to be ready
					await fakeWebSocketInterface?.standardConnectionHandshake();
					await fakeWebSocketInterface?.sendMessage(
						new MessageEvent('start_ack', {
							data: JSON.stringify({
								type: MESSAGE_TYPES.GQL_START_ACK,
								payload: { connectionTimeoutMs: 100 },
								id: fakeWebSocketInterface?.webSocket.subscriptionId,
							}),
						}),
					);

					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.Connected,
					]);
					expect(fakeWebSocketInterface?.observedConnectionStates).toEqual([
						CS.Disconnected,
						CS.Connecting,
						CS.Connected,
					]);

					subscription.unsubscribe();

					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.ConnectedPendingDisconnect,
					]);

					expect(fakeWebSocketInterface?.observedConnectionStates).toEqual([
						CS.Disconnected,
						CS.Connecting,
						CS.Connected,
						CS.ConnectedPendingDisconnect,
						CS.Disconnected,
					]);
				});

				test('returns error when no appSyncGraphqlEndpoint is provided', async () => {
					expect.assertions(2);
					const mockError = jest.fn();

					const provider = new AWSAppSyncRealTimeProvider();

					await Promise.resolve(
						provider.subscribe({}).subscribe({
							error(err) {
								expect(err.errors[0].message).toEqual(
									'Subscribe only available for AWS AppSync endpoint',
								);
								mockError();
							},
						}),
					);

					expect(mockError).toHaveBeenCalled();
				});

				test('subscription waiting for onopen with ws://localhost:8080 goes untranslated', async () => {
					expect.assertions(1);

					const newSocketSpy = jest
						.spyOn(provider, 'getNewWebSocket')
						.mockImplementation(() => {
							fakeWebSocketInterface.newWebSocket();
							return fakeWebSocketInterface.webSocket as WebSocket;
						});

					provider
						.subscribe({
							appSyncGraphqlEndpoint: 'ws://localhost:8080',
						})
						.subscribe({ error: () => {} });

					// Wait for the socket to be initialize
					await fakeWebSocketInterface.readyForUse;

					expect(newSocketSpy).toHaveBeenNthCalledWith(
						1,
						'ws://localhost:8080/realtime?header=&payload=e30=',
						'graphql-ws',
					);
				});

				test('subscription waiting for onopen with http://localhost:8080 translates to wss', async () => {
					expect.assertions(1);

					const newSocketSpy = jest
						.spyOn(provider, 'getNewWebSocket')
						.mockImplementation(() => {
							fakeWebSocketInterface.newWebSocket();
							return fakeWebSocketInterface.webSocket as WebSocket;
						});

					provider
						.subscribe({
							appSyncGraphqlEndpoint: 'http://localhost:8080',
						})
						.subscribe({ error: () => {} });

					// Wait for the socket to be initialize
					await fakeWebSocketInterface.readyForUse;

					expect(newSocketSpy).toHaveBeenNthCalledWith(
						1,
						'wss://localhost:8080/realtime?header=&payload=e30=',
						'graphql-ws',
					);
				});

				test('subscription waiting for onopen with https://testaccounturl123456789123.appsync-api.us-east-1.amazonaws.com/graphql" translates to wss', async () => {
					expect.assertions(1);

					const newSocketSpy = jest
						.spyOn(provider, 'getNewWebSocket')
						.mockImplementation(() => {
							fakeWebSocketInterface.newWebSocket();
							return fakeWebSocketInterface.webSocket as WebSocket;
						});

					provider
						.subscribe({
							appSyncGraphqlEndpoint:
								'https://testaccounturl123456789123.appsync-api.us-east-1.amazonaws.com/graphql',
						})
						.subscribe({ error: () => {} });

					// Wait for the socket to be initialize
					await fakeWebSocketInterface.readyForUse;

					expect(newSocketSpy).toHaveBeenNthCalledWith(
						1,
						'wss://testaccounturl123456789123.appsync-realtime-api.us-east-1.amazonaws.com/graphql?header=&payload=e30=',
						'graphql-ws',
					);
				});

				test('subscription fails when onerror triggered while waiting for onopen', async () => {
					expect.assertions(1);
					provider
						.subscribe({
							appSyncGraphqlEndpoint: 'ws://localhost:8080',
						})
						.subscribe({ error: () => {} });
					await fakeWebSocketInterface?.readyForUse;
					await fakeWebSocketInterface?.triggerError();
					expect(loggerSpy).toHaveBeenCalledWith(
						'DEBUG',
						'WebSocket connection error',
					);
				});

				test('subscription disrupted triggering reconnect when onclose triggered while waiting for onopen', async () => {
					expect.assertions(1);

					provider
						.subscribe({
							appSyncGraphqlEndpoint: 'ws://localhost:8080',
						})
						.subscribe({ error: () => {} });

					await fakeWebSocketInterface?.readyForUse;
					await fakeWebSocketInterface?.triggerClose();

					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.ConnectionDisrupted,
					]);
					// Watching for raised exception to be caught and logged
					expect(loggerSpy).toHaveBeenCalledWith(
						'DEBUG',
						expect.stringContaining('error on bound '),
						expect.objectContaining({
							message: expect.stringMatching('Connection handshake error'),
						}),
					);
					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.Connecting,
					]);
				});

				test('subscription reconnects when onclose triggered while offline and waiting for onopen', async () => {
					expect.assertions(1);
					reachabilityObserver?.next?.({ online: false });

					provider
						.subscribe({
							appSyncGraphqlEndpoint: 'ws://localhost:8080',
						})
						.subscribe({ error: () => {} });
					reachabilityObserver?.next?.({ online: false });
					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.Connecting,
					]);
					await fakeWebSocketInterface?.readyForUse;

					await fakeWebSocketInterface?.triggerClose();

					// Wait until the socket is disrupted pending network
					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.ConnectionDisruptedPendingNetwork,
					]);

					reachabilityObserver?.next?.({ online: true });

					// Wait until the socket is disrupted
					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.ConnectionDisrupted,
					]);

					// Wait until we've started connecting the second time
					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.Connecting,
					]);

					await fakeWebSocketInterface?.readyForUse;

					await fakeWebSocketInterface?.triggerOpen();

					fakeWebSocketInterface?.handShakeMessage({
						connectionTimeoutMs: 100,
					});

					await fakeWebSocketInterface?.startAckMessage();

					// Wait until the socket is automatically reconnected
					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.Connected,
					]);

					expect(fakeWebSocketInterface?.observedConnectionStates).toEqual([
						CS.Disconnected,
						CS.Connecting,
						CS.ConnectionDisruptedPendingNetwork,
						CS.ConnectionDisrupted,
						CS.Connecting,
						CS.Connected,
					]);
				});

				test('subscription fails when onerror triggered while waiting for handshake', async () => {
					expect.assertions(1);
					await replaceConstant('CONNECTION_INIT_TIMEOUT', 20, async () => {
						provider
							.subscribe({
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
							})
							.subscribe({ error: () => {} });

						await fakeWebSocketInterface?.readyForUse;
						await fakeWebSocketInterface?.triggerOpen();
						await fakeWebSocketInterface?.triggerError();
					});
					// When the socket throws an error during handshake
					expect(loggerSpy).toHaveBeenCalledWith(
						'DEBUG',
						'WebSocket error {"isTrusted":false}',
					);
				});

				test('subscription fails when onclose triggered while waiting for handshake', async () => {
					expect.assertions(1);

					await replaceConstant('CONNECTION_INIT_TIMEOUT', 20, async () => {
						provider
							.subscribe({
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
							})
							.subscribe({ error: () => {} });

						await fakeWebSocketInterface?.readyForUse;
						await fakeWebSocketInterface?.triggerOpen();
						await fakeWebSocketInterface?.triggerClose();
					});

					// When the socket is closed during handshake
					// Watching for raised exception to be caught and logged
					expect(loggerSpy).toHaveBeenCalledWith(
						'DEBUG',
						expect.stringContaining('error on bound '),
						expect.objectContaining({
							message: expect.stringMatching('{"isTrusted":false}'),
						}),
					);
				});

				test('subscription observer is triggered when a connection is formed and a data message is received before connection ack', async () => {
					expect.assertions(1);

					const mockNext = jest.fn();
					const observer = provider.subscribe({
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					observer.subscribe({
						// Succeed only when the first message comes through
						next: mockNext,
						// Closing a hot connection (for cleanup) makes it blow up the test stack
						error: () => {},
					});

					await fakeWebSocketInterface?.standardConnectionHandshake();

					await fakeWebSocketInterface?.sendDataMessage({
						type: MESSAGE_TYPES.GQL_DATA,
						payload: { data: {} },
					});

					expect(mockNext).toHaveBeenCalled();
				});

				test('subscription observer is triggered when a connection is formed and a data message is received after connection ack', async () => {
					expect.assertions(1);
					const mockNext = jest.fn();

					const observer = provider.subscribe({
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

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
						type: MESSAGE_TYPES.GQL_DATA,
						payload: { data: {} },
					});

					expect(mockNext).toHaveBeenCalled();
				});

				test('subscription observer is triggered when a connection is formed and a data message is received after connection ack and close triggered', async () => {
					expect.assertions(1);
					const mockNext = jest.fn();

					const observer = provider.subscribe({
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

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
						type: MESSAGE_TYPES.GQL_DATA,
						payload: { data: {} },
					});
					expect(mockNext).toHaveBeenCalled();
				});

				test('subscription observer error is triggered when a connection is formed the error is logged and reconnect is triggered', async () => {
					// Test for error message path message receipt has nothing to assert (only passes when error triggers error subscription method)
					expect.assertions(1);

					const observer = provider.subscribe({
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					observer.subscribe({
						error: () => {},
					});

					await fakeWebSocketInterface?.standardConnectionHandshake();
					await fakeWebSocketInterface?.sendDataMessage({
						type: MESSAGE_TYPES.GQL_ERROR,
						payload: { data: {} },
					});
					expect(loggerSpy).toHaveBeenCalledWith(
						'DEBUG',
						'Connection failed: {"data":{}}',
					);
					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.Connecting,
					]);
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
								'Connection failed: Non-retriable Test',
							);
						},
					});

					await fakeWebSocketInterface?.readyForUse;
					await fakeWebSocketInterface?.triggerOpen();

					// Resolve the message delivery actions
					await Promise.resolve(
						fakeWebSocketInterface?.sendDataMessage({
							type: MESSAGE_TYPES.GQL_CONNECTION_ERROR,
							payload: {
								errors: [
									{
										errorType: 'Non-retriable Test',
										errorCode: 400, // Not found - non-retriable
									},
								],
							},
						}),
					);

					// Watching for raised exception to be caught and logged
					expect(loggerSpy).toHaveBeenCalledWith(
						'DEBUG',
						expect.stringContaining('error on bound '),
						expect.objectContaining({
							message: expect.stringMatching('Non-retriable Test'),
						}),
					);

					expect(socketCloseSpy).toHaveBeenNthCalledWith(1, 3001);
				});

				test('subscription observer error is triggered when a connection is formed', async () => {
					expect.assertions(1);

					const observer = provider.subscribe({
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					observer.subscribe({
						error: x => {},
					});

					await fakeWebSocketInterface?.standardConnectionHandshake();
					await fakeWebSocketInterface?.triggerError();
					expect(loggerSpy).toHaveBeenCalledWith(
						'DEBUG',
						'Disconnect error: Connection closed',
					);
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
								payload: {
									errors: [
										{
											errorType: 'Retriable Test',
											errorCode: 408, // Request timed out - retriable
										},
									],
								},
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

				test('subscription observer error is triggered when a connection is formed and an ack data message is received then ka timeout prompts disconnect', async () => {
					expect.assertions(2);

					const observer = provider.subscribe({
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					observer.subscribe({ error: () => {} });
					// Resolve the message delivery actions
					await replaceConstant(
						'DEFAULT_KEEP_ALIVE_ALERT_TIMEOUT',
						5,
						async () => {
							await fakeWebSocketInterface?.readyForUse;
							await fakeWebSocketInterface?.triggerOpen();
							await fakeWebSocketInterface?.handShakeMessage({
								connectionTimeoutMs: 100,
							});

							await fakeWebSocketInterface?.startAckMessage();

							await fakeWebSocketInterface?.keepAlive();
						},
					);

					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.Connected,
					]);

					// Wait until the socket is automatically disconnected
					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.ConnectionDisrupted,
					]);

					expect(fakeWebSocketInterface?.observedConnectionStates).toContain(
						CS.ConnectedPendingKeepAlive,
					);

					expect(loggerSpy).toHaveBeenCalledWith(
						'DEBUG',
						'Disconnect error: Timeout disconnect',
					);
				});

				test('subscription connection disruption triggers automatic reconnection', async () => {
					expect.assertions(1);

					const observer = provider.subscribe({
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					observer.subscribe({ error: () => {} });
					// Resolve the message delivery actions

					await fakeWebSocketInterface?.readyForUse;
					await fakeWebSocketInterface?.triggerOpen();
					await fakeWebSocketInterface?.handShakeMessage({
						connectionTimeoutMs: 100,
					});
					await fakeWebSocketInterface?.startAckMessage();
					await fakeWebSocketInterface.keepAlive();

					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.Connected,
					]);

					// Wait until the socket is automatically disconnected
					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.ConnectionDisrupted,
					]);

					await fakeWebSocketInterface?.triggerOpen();

					await fakeWebSocketInterface?.handShakeMessage({
						connectionTimeoutMs: 100,
					});
					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.Connecting,
					]);
					fakeWebSocketInterface?.startAckMessage();
					await fakeWebSocketInterface.keepAlive();

					// Wait until the socket is automatically reconnected
					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.Connected,
					]);

					expect(fakeWebSocketInterface?.observedConnectionStates).toEqual([
						CS.Disconnected,
						CS.Connecting,
						CS.Connected,
						CS.ConnectionDisrupted,
						CS.Connecting,
						CS.Connected,
					]);
				});

				test('subscription connection disruption by network outage triggers automatic reconnection once network recovers', async () => {
					expect.assertions(1);

					const observer = provider.subscribe({
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					observer.subscribe({ error: () => {} });
					// Resolve the message delivery actions

					await fakeWebSocketInterface?.readyForUse;
					await fakeWebSocketInterface?.triggerOpen();
					await fakeWebSocketInterface?.handShakeMessage({
						connectionTimeoutMs: 100,
					});

					await fakeWebSocketInterface?.startAckMessage();
					await fakeWebSocketInterface.keepAlive();

					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.Connected,
					]);

					reachabilityObserver?.next?.({ online: false });

					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.ConnectedPendingNetwork,
					]);

					fakeWebSocketInterface?.closeInterface();

					// Wait until the socket is automatically disconnected
					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.ConnectionDisruptedPendingNetwork,
					]);

					reachabilityObserver?.next?.({ online: true });

					// Wait until the socket is automatically disconnected
					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.ConnectionDisrupted,
					]);

					await fakeWebSocketInterface?.triggerOpen();
					await fakeWebSocketInterface?.handShakeMessage();

					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.Connecting,
					]);

					await fakeWebSocketInterface?.startAckMessage();

					// Wait until the socket is automatically reconnected
					await fakeWebSocketInterface?.waitUntilConnectionStateIn([
						CS.Connected,
					]);

					expect(fakeWebSocketInterface?.observedConnectionStates).toEqual([
						CS.Disconnected,
						CS.Connecting,
						CS.Connected,
						CS.ConnectedPendingNetwork,
						CS.ConnectionDisruptedPendingNetwork,
						CS.ConnectionDisrupted,
						CS.Connecting,
						CS.Connected,
					]);
				});

				test('socket is closed when subscription is closed', async () => {
					expect.assertions(1);

					const observer = provider.subscribe({
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					const subscription = observer.subscribe({ error: () => {} });

					await fakeWebSocketInterface?.standardConnectionHandshake();
					await fakeWebSocketInterface?.sendDataMessage({
						type: MESSAGE_TYPES.GQL_DATA,
						payload: { data: {} },
					});
					await subscription.unsubscribe();
					await fakeWebSocketInterface?.triggerClose();

					expect(fakeWebSocketInterface.hasClosed).resolves.toBeUndefined();
				});

				test('failure to ack before timeout', async () => {
					expect.assertions(1);

					await replaceConstant('START_ACK_TIMEOUT', 30, async () => {
						const observer = provider.subscribe({
							appSyncGraphqlEndpoint: 'ws://localhost:8080',
						});

						observer.subscribe({ error: () => {} });

						await fakeWebSocketInterface?.standardConnectionHandshake();

						// Wait until the socket is automatically disconnected
						await fakeWebSocketInterface?.waitForConnectionState([
							CS.ConnectionDisrupted,
						]);

						expect(loggerSpy).toHaveBeenCalledWith(
							'DEBUG',
							'timeoutStartSubscription',
							expect.anything(),
						);
					});
				});

				test('connection init timeout met', async () => {
					expect.assertions(2);
					await replaceConstant('CONNECTION_INIT_TIMEOUT', 20, async () => {
						const observer = provider.subscribe({
							appSyncGraphqlEndpoint: 'ws://localhost:8080',
						});

						observer.subscribe({ error: () => {} });

						await fakeWebSocketInterface?.readyForUse;
						Promise.resolve();
						await fakeWebSocketInterface?.triggerOpen();
						Promise.resolve();
						await fakeWebSocketInterface?.handShakeMessage();

						// Wait no less than 20 ms
						await delay(20);

						// Wait until the socket is automatically disconnected
						await expect(
							fakeWebSocketInterface?.hubConnectionListener
								?.currentConnectionState,
						).toBe(CS.Connecting);

						// Watching for raised exception to be caught and logged
						expect(loggerSpy).not.toHaveBeenCalledWith(
							'DEBUG',
							expect.stringContaining('error on bound '),
							expect.objectContaining({
								message: expect.stringMatching(
									'Connection timeout: ack from AWSAppSyncRealTime was not received after',
								),
							}),
						);
					});
				});

				test('connection init timeout missed', async () => {
					expect.assertions(1);

					await replaceConstant('CONNECTION_INIT_TIMEOUT', 20, async () => {
						const observer = provider.subscribe({
							appSyncGraphqlEndpoint: 'ws://localhost:8080',
						});

						observer.subscribe({ error: () => {} });

						await fakeWebSocketInterface?.readyForUse;
						Promise.resolve();
						await fakeWebSocketInterface?.triggerOpen();

						// Wait no less than 20 ms
						await delay(20);

						// Wait until the socket is automatically disconnected
						await fakeWebSocketInterface?.waitUntilConnectionStateIn([
							CS.Disconnected,
						]);

						// Watching for raised exception to be caught and logged
						expect(loggerSpy).toHaveBeenCalledWith(
							'DEBUG',
							expect.stringContaining('error on bound '),
							expect.objectContaining({
								message: expect.stringMatching(
									'Connection timeout: ack from AWSAppSyncRealTime was not received after',
								),
							}),
						);
					});
				});

				describe('constructed against the different auth interfaces', () => {
					test('authenticating with API_KEY', async () => {
						expect.assertions(1);

						provider
							.subscribe({
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
								authenticationType: 'apiKey',
								apiKey: 'test',
							})
							.subscribe({ error: () => {} });

						await fakeWebSocketInterface?.readyForUse;

						expect(loggerSpy).toHaveBeenCalledWith(
							'DEBUG',
							'Authenticating with "apiKey"',
						);
					});

					test('authenticating with AWS_IAM', async () => {
						expect.assertions(1);

						provider
							.subscribe({
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
								authenticationType: 'iam',
							})
							.subscribe({ error: () => {} });

						await fakeWebSocketInterface?.readyForUse;

						expect(loggerSpy).toHaveBeenCalledWith(
							'DEBUG',
							'Authenticating with "iam"',
						);
					});

					test('authenticating with OPENID_CONNECT', async () => {
						expect.assertions(1);

						provider
							.subscribe({
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
								authenticationType: 'oidc',
							})
							.subscribe({ error: () => {} });

						await fakeWebSocketInterface?.readyForUse;

						expect(loggerSpy).toHaveBeenCalledWith(
							'DEBUG',
							'Authenticating with "oidc"',
						);
					});

					test('authenticating with OPENID_CONNECT from cached token', async () => {
						expect.assertions(1);

						provider
							.subscribe({
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
								authenticationType: 'oidc',
							})
							.subscribe({ error: () => {} });

						await fakeWebSocketInterface?.readyForUse;
						expect(loggerSpy).toHaveBeenCalledWith(
							'DEBUG',
							'Authenticating with "oidc"',
						);
					});

					test('authenticating with AWS_LAMBDA/custom', async () => {
						expect.assertions(1);

						provider
							.subscribe({
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
								authenticationType: 'none',
								additionalHeaders: {
									Authorization: 'test',
								},
							})
							.subscribe({ error: () => {} });

						await fakeWebSocketInterface?.readyForUse;

						expect(loggerSpy).toHaveBeenCalledWith(
							'DEBUG',
							'Authenticating with "none"',
						);
					});

					test('authenticating with userPool / custom library options token', async () => {
						expect.assertions(1);

						provider
							.subscribe({
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
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
							})
							.subscribe({ error: () => {} });

						await fakeWebSocketInterface?.readyForUse;

						expect(loggerSpy).toHaveBeenCalledWith(
							'DEBUG',
							'Authenticating with "userPool"',
						);
					});

					test('authenticating with AWS_LAMBDA/custom w/ custom header function', async () => {
						expect.assertions(1);

						provider
							.subscribe({
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
								authenticationType: 'none',
								additionalHeaders: async () => ({
									Authorization: 'test',
								}),
							})
							.subscribe({ error: () => {} });

						await fakeWebSocketInterface?.readyForUse;

						expect(loggerSpy).toBeCalledWith(
							'DEBUG',
							'Authenticating with "none"',
						);
					});

					test('authenticating with AWS_LAMBDA/custom w/ custom header function that accepts request options', async () => {
						expect.assertions(2);

						provider
							.subscribe({
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
								authenticationType: 'none',
								additionalHeaders: async requestOptions => {
									expect(requestOptions).toEqual(
										expect.objectContaining({
											queryString: '',
											url: 'ws://localhost:8080',
										}),
									);
									return { Authorization: 'test' };
								},
							})
							.subscribe({ error: () => {} });

						await fakeWebSocketInterface?.readyForUse;

						expect(loggerSpy).toHaveBeenCalledWith(
							'DEBUG',
							'Authenticating with "none"',
						);
					});

					test('authenticating with AWS_LAMBDA/custom without Authorization', async () => {
						expect.assertions(1);

						provider
							.subscribe({
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
								authenticationType: 'none',
								additionalHeaders: {
									Authorization: '',
								},
							})
							.subscribe({ error: () => {} });

						// TODO Find a better way to give the catch stack time to resolve
						await delay(10);

						expect(loggerSpy).toHaveBeenCalledWith(
							'DEBUG',
							'AppSync Realtime subscription init error: Error: No auth token specified',
						);
					});
				});
			});
		});
	});
});
