import { Auth } from '@aws-amplify/auth';
import { Credentials, Logger, Signer } from '@aws-amplify/core';
import { GraphQLError, isCompositeType } from 'graphql';
import Observable from 'zen-observable-ts';
import { AWSAppSyncRealTimeProvider } from '../src/Providers/AWSAppSyncRealTimeProvider';
import Cache from '@aws-amplify/cache';
import { MESSAGE_TYPES } from '../src/Providers/AWSAppSyncRealTimeProvider/constants';
import { FakeWebSocketInterface, replaceConstant } from './helpers';

describe('AWSAppSyncRealTimeProvider', () => {
	describe('isCustomDomain()', () => {
		test('Custom domain returns `true`', () => {
			const provider = new AWSAppSyncRealTimeProvider();
			const result = (provider as any).isCustomDomain(
				'https://unit-test.testurl.com/graphql'
			);
			expect(result).toBe(true);
		});

		test('Non-custom domain returns `false`', () => {
			const provider = new AWSAppSyncRealTimeProvider();
			const result = (provider as any).isCustomDomain(
				'https://12345678901234567890123456.appsync-api.us-west-2.amazonaws.com/graphql'
			);
			expect(result).toBe(false);
		});
	});

	describe('newClient()', () => {
		test('throws an error', () => {
			const provider = new AWSAppSyncRealTimeProvider();
			expect(provider.newClient).toThrow(Error('Not used here'));
		});
	});

	describe('getProviderName()', () => {
		test('returns the provider name', () => {
			const provider = new AWSAppSyncRealTimeProvider();
			expect(provider.getProviderName()).toEqual('AWSAppSyncRealTimeProvider');
		});
	});

	describe('publish()', () => {
		test("rejects raising an error indicating publish isn't supported", async () => {
			const provider = new AWSAppSyncRealTimeProvider();
			await expect(provider.publish('test', 'test')).rejects.toThrow(
				Error('Operation not supported')
			);
		});
	});

	describe('subscribe()', () => {
		test('returns an observable', () => {
			const provider = new AWSAppSyncRealTimeProvider();
			expect(provider.subscribe('test', {})).toBeInstanceOf(Observable);
		});

		describe('returned observer', () => {
			describe('connection logic with mocked websocket', () => {
				let fakeWebSocketInterface: FakeWebSocketInterface;
				const loggerSpy: jest.SpyInstance = jest.spyOn(
					Logger.prototype,
					'_log'
				);

				let provider: AWSAppSyncRealTimeProvider;

				beforeEach(async () => {
					fakeWebSocketInterface = new FakeWebSocketInterface();
					provider = new AWSAppSyncRealTimeProvider();

					// Saving this spy and resetting it by hand causes badness
					//     Saving it causes new websockets to be reachable across past tests that have not fully closed
					//     Resetting it proactively causes those same past tests to be dealing with null while they reach a settled state
					jest.spyOn(provider, 'getNewWebSocket').mockImplementation(() => {
						fakeWebSocketInterface.newWebSocket();
						return fakeWebSocketInterface.webSocket;
					});
				});

				afterEach(async () => {
					await fakeWebSocketInterface?.closeInterface();
					loggerSpy.mockClear();
				});

				test('returns error when no appSyncGraphqlEndpoint is provided', async () => {
					expect.assertions(2);
					const mockError = jest.fn();

					const provider = new AWSAppSyncRealTimeProvider();
					provider.subscribe('test', {}).subscribe({
						error(err) {
							expect(err.errors[0].message).toEqual(
								'Subscribe only available for AWS AppSync endpoint'
							);
							mockError();
						},
					});

					// Wait for the subscription to be processed
					await fakeWebSocketInterface?.wait(50);

					expect(mockError).toBeCalled();
				});

				test('subscription waiting for onopen with ws://localhost:8080 goes untranslated', async () => {
					expect.assertions(1);

					const newSocketSpy = jest
						.spyOn(provider, 'getNewWebSocket')
						.mockImplementation(() => {
							fakeWebSocketInterface.newWebSocket();
							return fakeWebSocketInterface.webSocket;
						});

					provider
						.subscribe('test', {
							appSyncGraphqlEndpoint: 'ws://localhost:8080',
						})
						.subscribe({});

					// Wait for the message to be received and processed
					await fakeWebSocketInterface?.wait(50);

					expect(newSocketSpy).toHaveBeenNthCalledWith(
						1,
						'ws://localhost:8080/realtime?header=IiI=&payload=e30=',
						'graphql-ws'
					);
				});

				test('subscription waiting for onopen with http://localhost:8080 translates to wss', async () => {
					expect.assertions(1);

					const newSocketSpy = jest
						.spyOn(provider, 'getNewWebSocket')
						.mockImplementation(() => {
							fakeWebSocketInterface.newWebSocket();
							return fakeWebSocketInterface.webSocket;
						});

					provider
						.subscribe('test', {
							appSyncGraphqlEndpoint: 'http://localhost:8080',
						})
						.subscribe({});

					// Wait for the message to be received and processed
					await fakeWebSocketInterface?.wait(50);

					expect(newSocketSpy).toHaveBeenNthCalledWith(
						1,
						'wss://localhost:8080/realtime?header=IiI=&payload=e30=',
						'graphql-ws'
					);
				});

				test('subscription waiting for onopen with https://testaccounturl123456789123.appsync-api.us-east-1.amazonaws.com/graphql" translates to wss', async () => {
					expect.assertions(1);

					const newSocketSpy = jest
						.spyOn(provider, 'getNewWebSocket')
						.mockImplementation(() => {
							fakeWebSocketInterface.newWebSocket();
							return fakeWebSocketInterface.webSocket;
						});

					provider
						.subscribe('test', {
							appSyncGraphqlEndpoint:
								'https://testaccounturl123456789123.appsync-api.us-east-1.amazonaws.com/graphql',
						})
						.subscribe({});

					// Wait for the message to be received and processed
					await fakeWebSocketInterface?.wait(50);

					expect(newSocketSpy).toHaveBeenNthCalledWith(
						1,
						'wss://testaccounturl123456789123.appsync-realtime-api.us-east-1.amazonaws.com/graphql?header=IiI=&payload=e30=',
						'graphql-ws'
					);
				});

				test('subscription fails when onerror triggered while waiting for onopen', async () => {
					expect.assertions(1);

					provider
						.subscribe('test', {
							appSyncGraphqlEndpoint: 'ws://localhost:8080',
						})
						.subscribe({});
					await fakeWebSocketInterface?.readyForUse;
					await fakeWebSocketInterface?.triggerError();
					expect(loggerSpy).toHaveBeenCalledWith(
						'DEBUG',
						'WebSocket connection error'
					);
				});

				test('subscription fails when onclose triggered while waiting for onopen', async () => {
					expect.assertions(1);

					provider
						.subscribe('test', {
							appSyncGraphqlEndpoint: 'ws://localhost:8080',
						})
						.subscribe({});
					await fakeWebSocketInterface?.readyForUse;
					await fakeWebSocketInterface?.triggerClose();
					await fakeWebSocketInterface?.wait(50);

					// Watching for raised exception to be caught and logged
					expect(loggerSpy).toBeCalledWith(
						'DEBUG',
						'error on bound ',
						expect.objectContaining({
							message: expect.stringMatching('Connection handshake error'),
						})
					);
				});

				test('subscription fails when onerror triggered while waiting for handshake', async () => {
					expect.assertions(1);

					provider
						.subscribe('test', {
							appSyncGraphqlEndpoint: 'ws://localhost:8080',
						})
						.subscribe({});
					await fakeWebSocketInterface?.readyForUse;
					await fakeWebSocketInterface?.triggerOpen();
					await fakeWebSocketInterface?.triggerError();

					// When the socket throws an error during handshake
					expect(loggerSpy).toHaveBeenCalledWith(
						'DEBUG',
						'WebSocket error {"isTrusted":false}'
					);
				});

				test('subscription fails when onclose triggered while waiting for handshake', async () => {
					expect.assertions(1);

					provider
						.subscribe('test', {
							appSyncGraphqlEndpoint: 'ws://localhost:8080',
						})
						.subscribe({});
					await fakeWebSocketInterface?.readyForUse;
					await fakeWebSocketInterface?.triggerOpen();
					await fakeWebSocketInterface?.triggerClose();

					// When the socket is closed during handshake
					// Watching for raised exception to be caught and logged
					expect(loggerSpy).toBeCalledWith(
						'DEBUG',
						'error on bound ',
						expect.objectContaining({
							message: expect.stringMatching('{"isTrusted":false}'),
						})
					);
				});

				test('subscription observer is triggered when a connection is formed and a data message is received before connection ack', async () => {
					expect.assertions(1);

					const mockNext = jest.fn();
					const observer = provider.subscribe('test', {
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					const subscription = observer.subscribe({
						// Succeed only when the first message comes through
						next: mockNext,
						// Closing a hot connection (for cleanup) makes it blow up the test stack
						error: () => {},
					});
					await fakeWebSocketInterface?.readyForUse;
					await fakeWebSocketInterface?.triggerOpen();
					await fakeWebSocketInterface?.handShakeMessage();
					await fakeWebSocketInterface?.sendDataMessage({
						type: MESSAGE_TYPES.GQL_DATA,
						payload: { data: {} },
					});

					expect(mockNext).toBeCalled();
				});

				test('subscription observer is triggered when a connection is formed and a data message is received after connection ack', async () => {
					expect.assertions(1);
					const mockNext = jest.fn();

					const observer = provider.subscribe('test', {
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					const subscription = observer.subscribe({
						// Succeed only when the first message comes through
						next: mockNext,
						// Closing a hot connection (for cleanup) makes it blow up the test stack
						error: () => {},
					});
					await fakeWebSocketInterface?.readyForUse;
					await fakeWebSocketInterface?.triggerOpen();
					await fakeWebSocketInterface?.handShakeMessage();
					await fakeWebSocketInterface?.sendMessage(
						new MessageEvent('start_ack', {
							data: JSON.stringify({
								type: MESSAGE_TYPES.GQL_START_ACK,
								payload: { connectionTimeoutMs: 100 },
							}),
						})
					);
					await fakeWebSocketInterface?.sendDataMessage({
						type: MESSAGE_TYPES.GQL_DATA,
						payload: { data: {} },
					});

					expect(mockNext).toBeCalled();
				});

				test('subscription observer is triggered when a connection is formed and a data message is received after connection ack and close triggered', async () => {
					expect.assertions(1);
					const mockNext = jest.fn();

					const observer = provider.subscribe('test', {
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					const subscription = observer.subscribe({
						// Succeed only when the first message comes through
						next: mockNext,
						// Closing a hot connection (for cleanup) makes it blow up the test stack
						error: () => {},
					});
					await fakeWebSocketInterface?.readyForUse;
					await fakeWebSocketInterface?.triggerOpen();
					await fakeWebSocketInterface?.handShakeMessage();
					await fakeWebSocketInterface?.sendMessage(
						new MessageEvent('start_ack', {
							data: JSON.stringify({
								type: MESSAGE_TYPES.GQL_START_ACK,
								payload: { connectionTimeoutMs: 100 },
							}),
						})
					);
					await fakeWebSocketInterface?.sendDataMessage({
						type: MESSAGE_TYPES.GQL_DATA,
						payload: { data: {} },
					});
					expect(mockNext).toBeCalled();
				});

				test('subscription observer error is triggered when a connection is formed and a error data message is received', async () => {
					// Test for error message path message receipt has nothing to assert (only passes when error triggers error subscription method)
					expect.assertions(1);
					const mockError = jest.fn();

					const observer = provider.subscribe('test', {
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					const subscription = observer.subscribe({
						// Succeed only when the first message comes through
						error: mockError,
					});

					await fakeWebSocketInterface?.readyForUse;
					await fakeWebSocketInterface?.triggerOpen();
					await fakeWebSocketInterface?.handShakeMessage();
					await fakeWebSocketInterface?.sendDataMessage({
						type: MESSAGE_TYPES.GQL_ERROR,
						payload: { data: {} },
					});
					expect(mockError).toBeCalled();
				});

				test('subscription observer error is triggered when a connection is formed and a non-retriable connection_error data message is received', async () => {
					expect.assertions(2);

					const socketCloseSpy = jest.spyOn(
						fakeWebSocketInterface.webSocket,
						'close'
					);
					fakeWebSocketInterface.webSocket.readyState = WebSocket.OPEN;

					const observer = provider.subscribe('test', {
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					const subscription = observer.subscribe({
						error: x => {},
					});

					await fakeWebSocketInterface?.readyForUse;
					await fakeWebSocketInterface?.triggerOpen();
					await fakeWebSocketInterface?.sendDataMessage({
						type: MESSAGE_TYPES.GQL_CONNECTION_ERROR,
						payload: {
							errors: [
								{
									errorType: 'Non-retriable Test',
									errorCode: 400, // Not found - non-retriable
								},
							],
						},
					});

					// Wait while the message is received and processed
					await fakeWebSocketInterface?.wait(50);

					// Watching for raised exception to be caught and logged
					expect(loggerSpy).toBeCalledWith(
						'DEBUG',
						'error on bound ',
						expect.objectContaining({
							message: expect.stringMatching('Non-retriable Test'),
						})
					);

					expect(socketCloseSpy).toHaveBeenNthCalledWith(1, 3001);
				});

				test('subscription observer error is triggered when a connection is formed', async () => {
					expect.assertions(1);

					const observer = provider.subscribe('test', {
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					const subscription = observer.subscribe({
						error: x => {},
					});

					await fakeWebSocketInterface?.readyForUse;
					await fakeWebSocketInterface?.triggerOpen();
					await fakeWebSocketInterface?.handShakeMessage();
					await fakeWebSocketInterface?.triggerError();
					expect(loggerSpy).toBeCalledWith(
						'DEBUG',
						'Disconnect error: Connection closed'
					);
				});

				test('subscription observer error is triggered when a connection is formed and a retriable connection_error data message is received', async () => {
					expect.assertions(1);

					const observer = provider.subscribe('test', {
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					const subscription = observer.subscribe({
						error: x => {},
					});

					await fakeWebSocketInterface?.readyForUse;
					await fakeWebSocketInterface?.triggerOpen();
					await fakeWebSocketInterface?.sendDataMessage({
						type: MESSAGE_TYPES.GQL_CONNECTION_ERROR,
						payload: {
							errors: [
								{
									errorType: 'Retriable Test',
									errorCode: 408, // Request timed out - retriable
								},
							],
						},
					});

					// Wait while the message is received and processed
					await fakeWebSocketInterface?.wait(50);

					// Watching for raised exception to be caught and logged
					expect(loggerSpy).toBeCalledWith(
						'DEBUG',
						'error on bound ',
						expect.objectContaining({
							message: expect.stringMatching('Retriable Test'),
						})
					);
				});

				test('subscription observer error is triggered when a connection is formed and an ack data message is received then ack timeout prompts disconnect', async () => {
					expect.assertions(1);

					const observer = provider.subscribe('test', {
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					const subscription = observer.subscribe({
						error: () => {},
					});

					await fakeWebSocketInterface?.readyForUse;
					await fakeWebSocketInterface?.triggerOpen();
					await fakeWebSocketInterface?.sendMessage(
						new MessageEvent('connection_ack', {
							data: JSON.stringify({
								type: MESSAGE_TYPES.GQL_CONNECTION_ACK,
								payload: { connectionTimeoutMs: 20 },
							}),
						})
					);
					// Wait for the connection timeout to get updated with the keep alive payload
					await fakeWebSocketInterface?.wait(10);

					await fakeWebSocketInterface?.sendDataMessage({
						type: MESSAGE_TYPES.GQL_CONNECTION_KEEP_ALIVE,
						payload: { data: {} },
					});

					// Now wait for the timeout to elapse
					await fakeWebSocketInterface?.wait(100);

					expect(loggerSpy).toBeCalledWith(
						'DEBUG',
						'Disconnect error: Timeout disconnect'
					);
				});

				test('socket is closed when subscription is closed', async () => {
					expect.assertions(1);

					const observer = provider.subscribe('test', {
						appSyncGraphqlEndpoint: 'ws://localhost:8080',
					});

					const subscription = observer.subscribe({});

					await fakeWebSocketInterface?.readyForUse;
					await fakeWebSocketInterface?.triggerOpen();
					await fakeWebSocketInterface?.handShakeMessage();
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

					await replaceConstant('START_ACK_TIMEOUT', 20, async () => {
						const observer = provider.subscribe('test', {
							appSyncGraphqlEndpoint: 'ws://localhost:8080',
						});

						const subscription = observer.subscribe({
							error: () => {},
						});

						await fakeWebSocketInterface?.readyForUse;
						await fakeWebSocketInterface?.triggerOpen();
						await fakeWebSocketInterface?.handShakeMessage();

						// Wait long enough that the shortened timeout will elapse
						await fakeWebSocketInterface?.wait(100);

						expect(loggerSpy).toBeCalledWith(
							'DEBUG',
							'timeoutStartSubscription',
							expect.anything()
						);
					});
				});

				test('connection init timeout', async () => {
					expect.assertions(1);

					await replaceConstant('CONNECTION_INIT_TIMEOUT', 20, async () => {
						const observer = provider.subscribe('test', {
							appSyncGraphqlEndpoint: 'ws://localhost:8080',
						});

						const subscription = observer.subscribe({
							error: () => {},
						});

						await fakeWebSocketInterface?.readyForUse;
						await fakeWebSocketInterface?.triggerOpen();

						// Wait long enough that the shortened timeout will elapse
						await fakeWebSocketInterface?.wait(100);

						// Watching for raised exception to be caught and logged
						expect(loggerSpy).toBeCalledWith(
							'DEBUG',
							'error on bound ',
							expect.objectContaining({
								message: expect.stringMatching(
									'Connection timeout: ack from AWSRealTime'
								),
							})
						);
					});
				});

				describe('constructed against the different auth interfaces', () => {
					test('authenticating with API_KEY', async () => {
						expect.assertions(1);

						const subscription = provider
							.subscribe('test', {
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
								authenticationType: 'API_KEY',
							})
							.subscribe({});
						await fakeWebSocketInterface?.readyForUse;

						expect(loggerSpy).toBeCalledWith(
							'DEBUG',
							'Authenticating with API_KEY'
						);
					});

					test('authenticating with AWS_IAM', async () => {
						expect.assertions(1);

						jest.spyOn(Credentials, 'get').mockResolvedValue({});
						jest.spyOn(Signer, 'sign').mockImplementation(() => {
							return {
								headers: {
									accept: 'application/json, text/javascript',
									'content-encoding': 'amz-1.0',
									'content-type': 'application/json; charset=UTF-8',
								},
							};
						});

						const subscription = provider
							.subscribe('test', {
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
								authenticationType: 'AWS_IAM',
							})
							.subscribe({});
						await fakeWebSocketInterface?.readyForUse;

						expect(loggerSpy).toBeCalledWith(
							'DEBUG',
							'Authenticating with AWS_IAM'
						);
					});

					test('authenticating with AWS_IAM without credentials', async () => {
						expect.assertions(1);

						jest.spyOn(Credentials, 'get').mockImplementation(() => {
							return Promise.resolve();
						});
						jest.spyOn(Signer, 'sign').mockImplementation(() => {
							return {
								headers: {
									accept: 'application/json, text/javascript',
									'content-encoding': 'amz-1.0',
									'content-type': 'application/json; charset=UTF-8',
								},
							};
						});

						const subscription = provider
							.subscribe('test', {
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
								authenticationType: 'AWS_IAM',
							})
							.subscribe({
								error: e => {
									expect(e).toEqual({
										errors: [
											{
												message:
													'AppSync Realtime subscription init error: Error: No credentials',
											},
										],
									});
								},
							});
					});

					test('authenticating with AWS_IAM with credentials exception', async () => {
						expect.assertions(2);

						jest.spyOn(Credentials, 'get').mockImplementation(() => {
							return Promise.reject('Errors out');
						});
						jest.spyOn(Signer, 'sign').mockImplementation(() => {
							return {
								headers: {
									accept: 'application/json, text/javascript',
									'content-encoding': 'amz-1.0',
									'content-type': 'application/json; charset=UTF-8',
								},
							};
						});

						const subscription = provider
							.subscribe('test', {
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
								authenticationType: 'AWS_IAM',
							})
							.subscribe({
								error: e => {
									expect(e).toEqual({
										errors: [
											{
												message:
													'AppSync Realtime subscription init error: Error: No credentials',
											},
										],
									});
								},
							});

						// It takes time for the credentials to resolve
						await fakeWebSocketInterface?.wait(50);

						expect(loggerSpy).toHaveBeenCalledWith(
							'WARN',
							'ensure credentials error',
							'Errors out'
						);
					});

					test('authenticating with OPENID_CONNECT', async () => {
						expect.assertions(1);

						const userSpy = jest
							.spyOn(Auth, 'currentAuthenticatedUser')
							.mockImplementation(() => {
								return Promise.resolve({
									token: 'test',
								});
							});

						const subscription = provider
							.subscribe('test', {
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
								authenticationType: 'OPENID_CONNECT',
							})
							.subscribe({});
						await fakeWebSocketInterface?.readyForUse;

						expect(loggerSpy).toBeCalledWith(
							'DEBUG',
							'Authenticating with OPENID_CONNECT'
						);
					});

					test('authenticating with OPENID_CONNECT with empty token', async () => {
						expect.assertions(1);

						const userSpy = jest
							.spyOn(Auth, 'currentAuthenticatedUser')
							.mockImplementation(() => {
								return Promise.resolve({
									token: undefined,
								});
							});

						const subscription = provider
							.subscribe('test', {
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
								authenticationType: 'OPENID_CONNECT',
							})
							.subscribe({
								error: e => {
									expect(e).toEqual({
										errors: [
											{
												message:
													'AppSync Realtime subscription init error: Error: No federated jwt',
											},
										],
									});
								},
							});
					});

					test('authenticating with OPENID_CONNECT from cached token', async () => {
						expect.assertions(1);

						const userSpy = jest
							.spyOn(Cache, 'getItem')
							.mockImplementation(() => {
								return Promise.resolve({
									token: 'test',
								});
							});

						const subscription = provider
							.subscribe('test', {
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
								authenticationType: 'OPENID_CONNECT',
							})
							.subscribe({});
						await fakeWebSocketInterface?.readyForUse;

						expect(loggerSpy).toBeCalledWith(
							'DEBUG',
							'Authenticating with OPENID_CONNECT'
						);
					});

					test('authenticating with AMAZON_COGNITO_USER_POOLS', async () => {
						expect.assertions(1);

						const sessionSpy = jest
							.spyOn(Auth, 'currentSession')
							.mockImplementation(() => {
								return Promise.resolve({
									getAccessToken: () => {
										return {
											getJwtToken: () => {},
										};
									},
								} as any);
							});

						const subscription = provider
							.subscribe('test', {
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
								authenticationType: 'AMAZON_COGNITO_USER_POOLS',
							})
							.subscribe({});
						await fakeWebSocketInterface?.readyForUse;

						expect(loggerSpy).toBeCalledWith(
							'DEBUG',
							'Authenticating with AMAZON_COGNITO_USER_POOLS'
						);
					});

					test('authenticating with AWS_LAMBDA', async () => {
						expect.assertions(1);

						const subscription = provider
							.subscribe('test', {
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
								authenticationType: 'AWS_LAMBDA',
								additionalHeaders: {
									Authorization: 'test',
								},
							})
							.subscribe({});
						await fakeWebSocketInterface?.readyForUse;

						expect(loggerSpy).toBeCalledWith(
							'DEBUG',
							'Authenticating with AWS_LAMBDA'
						);
					});

					test('authenticating with AWS_LAMBDA without Authorization', async () => {
						expect.assertions(1);

						const subscription = provider
							.subscribe('test', {
								appSyncGraphqlEndpoint: 'ws://localhost:8080',
								authenticationType: 'AWS_LAMBDA',
								additionalHeaders: {
									Authorization: undefined,
								},
							})
							.subscribe({
								error: e => {
									expect(e).toEqual({
										errors: [
											{
												message:
													'AppSync Realtime subscription init error: Error: No auth token specified',
											},
										],
									});
								},
							});
					});
				});
			});
		});
	});
});
