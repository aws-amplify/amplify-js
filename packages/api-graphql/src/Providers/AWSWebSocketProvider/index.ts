// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Observable, Subscription, SubscriptionLike } from 'rxjs';
import { GraphQLError } from 'graphql';
import { ConsoleLogger, Hub, HubPayload } from '@aws-amplify/core';
import {
	CustomUserAgentDetails,
	DocumentType,
	NonRetryableError,
	amplifyUuid,
	base64Encoder,
	isNonRetryableError,
	jitteredExponentialRetry,
} from '@aws-amplify/core/internals/utils';

import {
	CONTROL_MSG,
	ConnectionState,
	PubSubContentObserver,
} from '../../types/PubSub';
import {
	AMPLIFY_SYMBOL,
	CONNECTION_INIT_TIMEOUT,
	CONNECTION_STATE_CHANGE,
	DEFAULT_KEEP_ALIVE_ALERT_TIMEOUT,
	DEFAULT_KEEP_ALIVE_HEARTBEAT_TIMEOUT,
	MAX_DELAY_MS,
	MESSAGE_TYPES,
	NON_RETRYABLE_CODES,
	NON_RETRYABLE_ERROR_TYPES,
	SOCKET_STATUS,
	START_ACK_TIMEOUT,
	SUBSCRIPTION_STATUS,
} from '../constants';
import {
	CONNECTION_CHANGE,
	ConnectionStateMonitor,
} from '../../utils/ConnectionStateMonitor';
import {
	ReconnectEvent,
	ReconnectionMonitor,
} from '../../utils/ReconnectionMonitor';
import type { AWSAppSyncRealTimeProviderOptions } from '../AWSAppSyncRealTimeProvider';

import {
	additionalHeadersFromOptions,
	queryParamsFromCustomHeaders,
	realtimeUrlWithQueryString,
} from './appsyncUrl';
import { awsRealTimeHeaderBasedAuth } from './authHeaders';

const dispatchApiEvent = (payload: HubPayload) => {
	Hub.dispatch('api', payload, 'PubSub', AMPLIFY_SYMBOL);
};

export interface ObserverQuery {
	observer: PubSubContentObserver;
	query: string;
	variables: DocumentType;
	subscriptionState: SUBSCRIPTION_STATUS;
	subscriptionReadyCallback?(): void;
	subscriptionFailedCallback?(reason?: any): void;
	startAckTimeoutId?: ReturnType<typeof setTimeout>;
}

interface ParsedMessagePayload {
	type: string;
	payload: {
		connectionTimeoutMs: number;
		errors?: [{ errorType: string; errorCode: number }];
	};
}

interface AWSWebSocketProviderArgs {
	providerName: string;
	wsProtocolName: string;
	connectUri: string;
}

export abstract class AWSWebSocketProvider {
	protected logger: ConsoleLogger;
	protected subscriptionObserverMap = new Map<string, ObserverQuery>();
	protected allowNoSubscriptions = false;

	protected awsRealTimeSocket?: WebSocket;
	private socketStatus: SOCKET_STATUS = SOCKET_STATUS.CLOSED;
	private keepAliveTimestamp: number = Date.now();
	private keepAliveHeartbeatIntervalId?: ReturnType<typeof setInterval>;
	private promiseArray: { res(): void; rej(reason?: any): void }[] = [];
	private connectionState: ConnectionState | undefined;
	private readonly connectionStateMonitor = new ConnectionStateMonitor();
	private readonly reconnectionMonitor = new ReconnectionMonitor();
	private connectionStateMonitorSubscription: SubscriptionLike;
	private readonly wsProtocolName: string;
	private readonly wsConnectUri: string;

	constructor(args: AWSWebSocketProviderArgs) {
		this.logger = new ConsoleLogger(args.providerName);
		this.wsProtocolName = args.wsProtocolName;
		this.wsConnectUri = args.connectUri;

		this.connectionStateMonitorSubscription =
			this._startConnectionStateMonitoring();
	}

	/**
	 * Mark the socket closed and release all active listeners
	 */
	close() {
		// Mark the socket closed both in status and the connection monitor
		this.socketStatus = SOCKET_STATUS.CLOSED;
		this.connectionStateMonitor.record(CONNECTION_CHANGE.CONNECTION_FAILED);

		// Turn off the subscription monitor Hub publishing
		this.connectionStateMonitorSubscription.unsubscribe();
		// Complete all reconnect observers
		this.reconnectionMonitor.close();

		return new Promise<void>((resolve, reject) => {
			if (this.awsRealTimeSocket) {
				this.awsRealTimeSocket.onclose = (_: CloseEvent) => {
					this._closeSocket();
					this.subscriptionObserverMap = new Map();
					this.awsRealTimeSocket = undefined;
					resolve();
				};

				this.awsRealTimeSocket.onerror = (err: any) => {
					reject(err);
				};

				this.awsRealTimeSocket.close();
			} else {
				resolve();
			}
		});
	}

	subscribe(
		options?: AWSAppSyncRealTimeProviderOptions,
		customUserAgentDetails?: CustomUserAgentDetails,
	): Observable<Record<string, unknown>> {
		return new Observable(observer => {
			if (!options?.appSyncGraphqlEndpoint) {
				observer.error({
					errors: [
						{
							...new GraphQLError(
								`Subscribe only available for AWS AppSync endpoint`,
							),
						},
					],
				});
				observer.complete();

				return;
			}

			let subscriptionStartInProgress = false;
			const subscriptionId = amplifyUuid();

			const startSubscription = () => {
				if (!subscriptionStartInProgress) {
					subscriptionStartInProgress = true;

					this._startSubscriptionWithAWSAppSyncRealTime({
						options,
						observer,
						subscriptionId,
						customUserAgentDetails,
					})
						.catch(err => {
							this.logger.debug(
								`${CONTROL_MSG.REALTIME_SUBSCRIPTION_INIT_ERROR}: ${err}`,
							);
							this._closeSocket();
						})
						.finally(() => {
							subscriptionStartInProgress = false;
						});
				}
			};

			// Add an observable to the reconnection list to manage reconnection for this subscription
			const reconnectSubscription = new Observable(
				reconnectSubscriptionObserver => {
					this.reconnectionMonitor.addObserver(reconnectSubscriptionObserver);
				},
			).subscribe(() => {
				startSubscription();
			});

			startSubscription();

			return async () => {
				await this._cleanupSubscription(subscriptionId, reconnectSubscription);
			};
		});
	}

	protected async connect(
		options: AWSAppSyncRealTimeProviderOptions,
	): Promise<void> {
		if (this.socketStatus === SOCKET_STATUS.READY) {
			return;
		}

		await this._connectWebSocket(options);
	}

	protected async publish(
		options: AWSAppSyncRealTimeProviderOptions,
		customUserAgentDetails?: CustomUserAgentDetails,
	): Promise<void> {
		if (this.socketStatus !== SOCKET_STATUS.READY) {
			throw new Error('Subscription has not been initialized');
		}

		return this._publishMessage(options, customUserAgentDetails);
	}

	private async _connectWebSocket(options: AWSAppSyncRealTimeProviderOptions) {
		const { apiKey, appSyncGraphqlEndpoint, authenticationType, region } =
			options;

		const { additionalCustomHeaders } =
			await additionalHeadersFromOptions(options);

		this.connectionStateMonitor.record(CONNECTION_CHANGE.OPENING_CONNECTION);
		await this._initializeWebSocketConnection({
			apiKey,
			appSyncGraphqlEndpoint,
			authenticationType,
			region,
			additionalCustomHeaders,
		});
	}

	private async _publishMessage(
		options: AWSAppSyncRealTimeProviderOptions,
		customUserAgentDetails?: CustomUserAgentDetails,
	): Promise<void> {
		const subscriptionId = amplifyUuid();

		const { additionalCustomHeaders, libraryConfigHeaders } =
			await additionalHeadersFromOptions(options);

		const serializedSubscriptionMessage =
			await this._prepareSubscriptionPayload({
				options,
				subscriptionId,
				customUserAgentDetails,
				additionalCustomHeaders,
				libraryConfigHeaders,
				publish: true,
			});

		return new Promise((resolve, reject) => {
			if (this.awsRealTimeSocket) {
				const publishListener = (event: MessageEvent) => {
					const data = JSON.parse(event.data);
					if (data.id === subscriptionId && data.type === 'publish_success') {
						this.awsRealTimeSocket &&
							this.awsRealTimeSocket.removeEventListener(
								'message',
								publishListener,
							);
						cleanup();
						resolve();
					}

					if (data.errors && data.errors.length > 0) {
						const errorTypes = data.errors.map((error: any) => error.errorType);
						cleanup();
						reject(new Error(`Publish errors: ${errorTypes.join(', ')}`));
					}
				};

				const errorListener = (error: Event) => {
					cleanup();
					reject(new Error(`WebSocket error: ${error}`));
				};

				const closeListener = () => {
					cleanup();
					reject(new Error('WebSocket is closed'));
				};

				const cleanup = () => {
					this.awsRealTimeSocket?.removeEventListener(
						'message',
						publishListener,
					);
					this.awsRealTimeSocket?.removeEventListener('error', errorListener);
					this.awsRealTimeSocket?.removeEventListener('close', closeListener);
				};

				this.awsRealTimeSocket.addEventListener('message', publishListener);
				this.awsRealTimeSocket.addEventListener('error', errorListener);
				this.awsRealTimeSocket.addEventListener('close', closeListener);

				this.awsRealTimeSocket.send(serializedSubscriptionMessage);
			} else {
				reject(new Error('WebSocket is not connected'));
			}
		});
	}

	private async _cleanupSubscription(
		subscriptionId: string,
		reconnectSubscription: Subscription,
	) {
		// Cleanup reconnection subscription
		reconnectSubscription?.unsubscribe();

		// Cleanup after unsubscribing or observer.complete was called after _startSubscriptionWithAWSAppSyncRealTime
		try {
			// Waiting that subscription has been connected before trying to unsubscribe
			await this._waitForSubscriptionToBeConnected(subscriptionId);

			const { subscriptionState } =
				this.subscriptionObserverMap.get(subscriptionId) || {};

			if (!subscriptionState) {
				// subscription already unsubscribed
				return;
			}

			if (subscriptionState === SUBSCRIPTION_STATUS.CONNECTED) {
				this._sendUnsubscriptionMessage(subscriptionId);
			} else {
				throw new Error('Subscription never connected');
			}
		} catch (err) {
			this.logger.debug(`Error while unsubscribing ${err}`);
		} finally {
			this._removeSubscriptionObserver(subscriptionId);
		}
	}

	// Monitor the connection state and pass changes along to Hub
	private _startConnectionStateMonitoring() {
		return this.connectionStateMonitor.connectionStateObservable.subscribe(
			connectionState => {
				dispatchApiEvent({
					event: CONNECTION_STATE_CHANGE,
					data: {
						provider: this,
						connectionState,
					},
					message: `Connection state is ${connectionState}`,
				});
				this.connectionState = connectionState;

				// Trigger START_RECONNECT when the connection is disrupted
				if (connectionState === ConnectionState.ConnectionDisrupted) {
					this.reconnectionMonitor.record(ReconnectEvent.START_RECONNECT);
				}

				// Trigger HALT_RECONNECT to halt reconnection attempts when the state is anything other than
				// ConnectionDisrupted or Connecting
				if (
					[
						ConnectionState.Connected,
						ConnectionState.ConnectedPendingDisconnect,
						ConnectionState.ConnectedPendingKeepAlive,
						ConnectionState.ConnectedPendingNetwork,
						ConnectionState.ConnectionDisruptedPendingNetwork,
						ConnectionState.Disconnected,
					].includes(connectionState)
				) {
					this.reconnectionMonitor.record(ReconnectEvent.HALT_RECONNECT);
				}
			},
		);
	}

	protected abstract _prepareSubscriptionPayload(param: {
		options: AWSAppSyncRealTimeProviderOptions;
		subscriptionId: string;
		customUserAgentDetails: CustomUserAgentDetails | undefined;
		additionalCustomHeaders: Record<string, string>;
		libraryConfigHeaders: Record<string, string>;
		publish?: boolean;
	}): Promise<string>;

	private async _startSubscriptionWithAWSAppSyncRealTime({
		options,
		observer,
		subscriptionId,
		customUserAgentDetails,
	}: {
		options: AWSAppSyncRealTimeProviderOptions;
		observer: PubSubContentObserver;
		subscriptionId: string;
		customUserAgentDetails: CustomUserAgentDetails | undefined;
	}) {
		const { query, variables } = options;

		this.subscriptionObserverMap.set(subscriptionId, {
			observer,
			query: query ?? '',
			variables: variables ?? {},
			subscriptionState: SUBSCRIPTION_STATUS.PENDING,
			startAckTimeoutId: undefined,
		});

		const { additionalCustomHeaders, libraryConfigHeaders } =
			await additionalHeadersFromOptions(options);

		const serializedSubscriptionMessage =
			await this._prepareSubscriptionPayload({
				options,
				subscriptionId,
				customUserAgentDetails,
				additionalCustomHeaders,
				libraryConfigHeaders,
			});

		try {
			await this._connectWebSocket(options);
		} catch (err: any) {
			this._logStartSubscriptionError(subscriptionId, observer, err);

			return;
		}

		// Potential race condition can occur when unsubscribe is called during _initializeWebSocketConnection.
		// E.g.unsubscribe gets invoked prior to finishing WebSocket handshake or START_ACK.
		// Both subscriptionFailedCallback and subscriptionReadyCallback are used to synchronized this.
		const { subscriptionFailedCallback, subscriptionReadyCallback } =
			this.subscriptionObserverMap.get(subscriptionId) ?? {};

		// This must be done before sending the message in order to be listening immediately
		this.subscriptionObserverMap.set(subscriptionId, {
			observer,
			subscriptionState: SUBSCRIPTION_STATUS.PENDING,
			query: query ?? '',
			variables: variables ?? {},
			subscriptionReadyCallback,
			subscriptionFailedCallback,
			startAckTimeoutId: setTimeout(() => {
				this._timeoutStartSubscriptionAck(subscriptionId);
			}, START_ACK_TIMEOUT),
		});

		if (this.awsRealTimeSocket) {
			this.awsRealTimeSocket.send(serializedSubscriptionMessage);
		}
	}

	// Log logic for start subscription failures
	private _logStartSubscriptionError(
		subscriptionId: string,
		observer: PubSubContentObserver,
		err: { message?: string },
	) {
		this.logger.debug({ err });
		const message = String(err.message ?? '');
		// Resolving to give the state observer time to propogate the update
		this._closeSocket();

		// Capture the error only when the network didn't cause disruption
		if (
			this.connectionState !== ConnectionState.ConnectionDisruptedPendingNetwork
		) {
			// When the error is non-retriable, error out the observable
			if (isNonRetryableError(err)) {
				observer.error({
					errors: [
						{
							...new GraphQLError(
								`${CONTROL_MSG.CONNECTION_FAILED}: ${message}`,
							),
						},
					],
				});
			} else {
				this.logger.debug(`${CONTROL_MSG.CONNECTION_FAILED}: ${message}`);
			}

			const { subscriptionFailedCallback } =
				this.subscriptionObserverMap.get(subscriptionId) || {};

			// Notify concurrent unsubscription
			if (typeof subscriptionFailedCallback === 'function') {
				subscriptionFailedCallback();
			}
		}
	}

	// Waiting that subscription has been connected before trying to unsubscribe
	private async _waitForSubscriptionToBeConnected(subscriptionId: string) {
		const subscriptionObserver =
			this.subscriptionObserverMap.get(subscriptionId);

		if (subscriptionObserver) {
			const { subscriptionState } = subscriptionObserver;
			// This in case unsubscribe is invoked before sending start subscription message
			if (subscriptionState === SUBSCRIPTION_STATUS.PENDING) {
				return new Promise<void>((resolve, reject) => {
					const {
						observer,
						subscriptionState: observedSubscriptionState,
						variables,
						query,
					} = subscriptionObserver;
					this.subscriptionObserverMap.set(subscriptionId, {
						observer,
						subscriptionState: observedSubscriptionState,
						variables,
						query,
						subscriptionReadyCallback: resolve,
						subscriptionFailedCallback: reject,
					});
				});
			}
		}
	}

	protected abstract _unsubscribeMessage(subscriptionId: string): {
		id: string;
		type: string;
	};

	private _sendUnsubscriptionMessage(subscriptionId: string) {
		try {
			if (
				this.awsRealTimeSocket &&
				this.awsRealTimeSocket.readyState === WebSocket.OPEN &&
				this.socketStatus === SOCKET_STATUS.READY
			) {
				// Preparing unsubscribe message to stop receiving messages for that subscription
				const unsubscribeMessage = this._unsubscribeMessage(subscriptionId);
				const stringToAWSRealTime = JSON.stringify(unsubscribeMessage);
				this.awsRealTimeSocket.send(stringToAWSRealTime);
			}
		} catch (err) {
			// If GQL_STOP is not sent because of disconnection issue, then there is nothing the client can do
			this.logger.debug({ err });
		}
	}

	private _removeSubscriptionObserver(subscriptionId: string) {
		this.subscriptionObserverMap.delete(subscriptionId);

		// Verifying 1000ms after removing subscription in case there are new subscription unmount/mount
		if (!this.allowNoSubscriptions) {
			setTimeout(this._closeSocketIfRequired.bind(this), 1000);
		}
	}

	protected _closeSocketIfRequired() {
		if (this.subscriptionObserverMap.size > 0) {
			// Active subscriptions on the WebSocket
			return;
		}

		if (!this.awsRealTimeSocket) {
			this.socketStatus = SOCKET_STATUS.CLOSED;

			return;
		}

		this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSING_CONNECTION);

		if (this.awsRealTimeSocket.bufferedAmount > 0) {
			// Still data on the WebSocket
			setTimeout(this._closeSocketIfRequired.bind(this), 1000);
		} else {
			this.logger.debug('closing WebSocket...');

			const tempSocket = this.awsRealTimeSocket;
			// Cleaning callbacks to avoid race condition, socket still exists
			tempSocket.onclose = null;
			tempSocket.onerror = null;
			tempSocket.close(1000);
			this.awsRealTimeSocket = undefined;
			this.socketStatus = SOCKET_STATUS.CLOSED;
			this._closeSocket();
		}
	}

	protected abstract _handleSubscriptionData(
		message: MessageEvent,
	): [
		boolean,
		{ id: string; payload: string | Record<string, unknown>; type: string },
	];

	protected abstract _extractConnectionTimeout(
		data: Record<string, any>,
	): number;

	protected abstract _extractErrorCodeAndType(data: Record<string, any>): {
		errorCode: number;
		errorType: string;
	};

	private maintainKeepAlive() {
		this.keepAliveTimestamp = Date.now();
	}

	private keepAliveHeartbeat(connectionTimeoutMs: number) {
		const currentTime = Date.now();

		// Check for missed KA message
		if (
			currentTime - this.keepAliveTimestamp >
			DEFAULT_KEEP_ALIVE_ALERT_TIMEOUT
		) {
			this.connectionStateMonitor.record(CONNECTION_CHANGE.KEEP_ALIVE_MISSED);
		} else {
			this.connectionStateMonitor.record(CONNECTION_CHANGE.KEEP_ALIVE);
		}

		// Recognize we are disconnected if we haven't seen messages in the keep alive timeout period
		if (currentTime - this.keepAliveTimestamp > connectionTimeoutMs) {
			this._errorDisconnect(CONTROL_MSG.TIMEOUT_DISCONNECT);
		}
	}

	private _handleIncomingSubscriptionMessage(message: MessageEvent) {
		if (typeof message.data !== 'string') {
			return;
		}

		const [isData, data] = this._handleSubscriptionData(message);
		if (isData) {
			this.maintainKeepAlive();

			return;
		}

		const { type, id, payload } = data;

		const {
			observer = null,
			query = '',
			variables = {},
			startAckTimeoutId,
			subscriptionReadyCallback,
			subscriptionFailedCallback,
		} = this.subscriptionObserverMap.get(id) || {};

		if (
			type === MESSAGE_TYPES.GQL_START_ACK ||
			type === MESSAGE_TYPES.EVENT_SUBSCRIBE_ACK
		) {
			this.logger.debug(
				`subscription ready for ${JSON.stringify({ query, variables })}`,
			);
			if (typeof subscriptionReadyCallback === 'function') {
				subscriptionReadyCallback();
			}
			if (startAckTimeoutId) clearTimeout(startAckTimeoutId);
			dispatchApiEvent({
				event: CONTROL_MSG.SUBSCRIPTION_ACK,
				data: { query, variables },
				message: 'Connection established for subscription',
			});
			const subscriptionState = SUBSCRIPTION_STATUS.CONNECTED;
			if (observer) {
				this.subscriptionObserverMap.set(id, {
					observer,
					query,
					variables,
					startAckTimeoutId: undefined,
					subscriptionState,
					subscriptionReadyCallback,
					subscriptionFailedCallback,
				});
			}
			this.connectionStateMonitor.record(
				CONNECTION_CHANGE.CONNECTION_ESTABLISHED,
			);

			return;
		}

		if (type === MESSAGE_TYPES.GQL_CONNECTION_KEEP_ALIVE) {
			this.maintainKeepAlive();

			return;
		}

		if (type === MESSAGE_TYPES.GQL_ERROR) {
			const subscriptionState = SUBSCRIPTION_STATUS.FAILED;
			if (observer) {
				this.subscriptionObserverMap.set(id, {
					observer,
					query,
					variables,
					startAckTimeoutId,
					subscriptionReadyCallback,
					subscriptionFailedCallback,
					subscriptionState,
				});

				this.logger.debug(
					`${CONTROL_MSG.CONNECTION_FAILED}: ${JSON.stringify(payload ?? data)}`,
				);

				observer.error({
					errors: [
						{
							...new GraphQLError(
								`${CONTROL_MSG.CONNECTION_FAILED}: ${JSON.stringify(payload ?? data)}`,
							),
						},
					],
				});

				if (startAckTimeoutId) clearTimeout(startAckTimeoutId);

				if (typeof subscriptionFailedCallback === 'function') {
					subscriptionFailedCallback();
				}
			}
		}
	}

	private _errorDisconnect(msg: string) {
		this.logger.debug(`Disconnect error: ${msg}`);

		if (this.awsRealTimeSocket) {
			this._closeSocket();
			this.awsRealTimeSocket.close();
		}

		this.socketStatus = SOCKET_STATUS.CLOSED;
	}

	private _closeSocket() {
		if (this.keepAliveHeartbeatIntervalId) {
			clearInterval(this.keepAliveHeartbeatIntervalId);
			this.keepAliveHeartbeatIntervalId = undefined;
		}
		this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);
	}

	private _timeoutStartSubscriptionAck(subscriptionId: string) {
		const subscriptionObserver =
			this.subscriptionObserverMap.get(subscriptionId);
		if (subscriptionObserver) {
			const { observer, query, variables } = subscriptionObserver;
			if (!observer) {
				return;
			}
			this.subscriptionObserverMap.set(subscriptionId, {
				observer,
				query,
				variables,
				subscriptionState: SUBSCRIPTION_STATUS.FAILED,
			});

			this._closeSocket();
			this.logger.debug(
				'timeoutStartSubscription',
				JSON.stringify({ query, variables }),
			);
		}
	}

	private _initializeWebSocketConnection({
		appSyncGraphqlEndpoint,
		authenticationType,
		apiKey,
		region,
		additionalCustomHeaders,
	}: AWSAppSyncRealTimeProviderOptions) {
		if (this.socketStatus === SOCKET_STATUS.READY) {
			return;
		}

		// TODO(Eslint): refactor to now use async function as the promise executor
		// eslint-disable-next-line no-async-promise-executor
		return new Promise<void>(async (resolve, reject) => {
			this.promiseArray.push({ res: resolve, rej: reject });

			if (this.socketStatus === SOCKET_STATUS.CLOSED) {
				try {
					this.socketStatus = SOCKET_STATUS.CONNECTING;

					// Empty payload on connect
					const payloadString = '{}';

					const authHeader = await awsRealTimeHeaderBasedAuth({
						authenticationType,
						payload: payloadString,
						canonicalUri: this.wsConnectUri,
						apiKey,
						appSyncGraphqlEndpoint,
						region,
						additionalCustomHeaders,
					});

					const headerString = authHeader ? JSON.stringify(authHeader) : '';
					// base64url-encoded string
					const encodedHeader = base64Encoder.convert(headerString, {
						urlSafe: true,
						skipPadding: true,
					});

					const authTokenSubprotocol = `header-${encodedHeader}`;

					const queryParams = queryParamsFromCustomHeaders(
						additionalCustomHeaders,
					);

					const awsRealTimeUrl = realtimeUrlWithQueryString(
						appSyncGraphqlEndpoint,
						queryParams,
					);

					await this._establishRetryableConnection(
						awsRealTimeUrl,
						authTokenSubprotocol,
					);

					this.promiseArray.forEach(({ res }) => {
						this.logger.debug('Notifying connection successful');
						res();
					});
					this.socketStatus = SOCKET_STATUS.READY;
					this.promiseArray = [];
				} catch (err) {
					this.logger.debug('Connection exited with', err);
					this.promiseArray.forEach(({ rej }) => {
						rej(err);
					});
					this.promiseArray = [];
					if (
						this.awsRealTimeSocket &&
						this.awsRealTimeSocket.readyState === WebSocket.OPEN
					) {
						this.awsRealTimeSocket.close(3001);
					}
					this.awsRealTimeSocket = undefined;
					this.socketStatus = SOCKET_STATUS.CLOSED;
				}
			}
		});
	}

	private async _establishRetryableConnection(
		awsRealTimeUrl: string,
		subprotocol: string,
	) {
		this.logger.debug(`Establishing retryable connection`);
		await jitteredExponentialRetry(
			this._establishConnection.bind(this),
			[awsRealTimeUrl, subprotocol],
			MAX_DELAY_MS,
		);
	}

	private async _openConnection(awsRealTimeUrl: string, subprotocol: string) {
		return new Promise<void>((resolve, reject) => {
			const newSocket = this._getNewWebSocket(awsRealTimeUrl, [
				this.wsProtocolName,
				subprotocol,
			]);

			newSocket.onerror = () => {
				this.logger.debug(`WebSocket connection error`);
			};
			newSocket.onclose = () => {
				this._closeSocket();
				reject(new Error('Connection handshake error'));
			};
			newSocket.onopen = () => {
				this.awsRealTimeSocket = newSocket;
				resolve();
			};
		});
	}

	private _getNewWebSocket(url: string, protocol: string[]) {
		return new WebSocket(url, protocol);
	}

	private async _initiateHandshake(): Promise<string> {
		return new Promise((resolve, reject) => {
			if (!this.awsRealTimeSocket) {
				reject(new Error('awsRealTimeSocket undefined'));

				return;
			}

			let ackOk = false;

			this.awsRealTimeSocket.onerror = error => {
				this.logger.debug(`WebSocket error ${JSON.stringify(error)}`);
			};

			this.awsRealTimeSocket.onclose = event => {
				this.logger.debug(`WebSocket closed ${event.reason}`);
				this._closeSocket();
				reject(new Error(JSON.stringify(event)));
			};

			this.awsRealTimeSocket.onmessage = (message: MessageEvent) => {
				if (typeof message.data !== 'string') {
					return;
				}
				this.logger.debug(
					`subscription message from AWS AppSyncRealTime: ${message.data} `,
				);

				const data = JSON.parse(message.data) as ParsedMessagePayload;

				const { type } = data;

				const connectionTimeoutMs = this._extractConnectionTimeout(data);

				if (type === MESSAGE_TYPES.GQL_CONNECTION_ACK) {
					ackOk = true;
					this._registerWebsocketHandlers(connectionTimeoutMs);
					resolve('Connected to AWS AppSyncRealTime');

					return;
				}

				if (type === MESSAGE_TYPES.GQL_CONNECTION_ERROR) {
					const { errorType, errorCode } = this._extractErrorCodeAndType(data);

					// TODO(Eslint): refactor to reject an Error object instead of a plain object
					// eslint-disable-next-line prefer-promise-reject-errors
					reject({ errorType, errorCode });
				}
			};

			const gqlInit = {
				type: MESSAGE_TYPES.GQL_CONNECTION_INIT,
			};
			this.awsRealTimeSocket.send(JSON.stringify(gqlInit));

			const checkAckOk = (targetAckOk: boolean) => {
				if (!targetAckOk) {
					this.connectionStateMonitor.record(
						CONNECTION_CHANGE.CONNECTION_FAILED,
					);
					reject(
						new Error(
							`Connection timeout: ack from AWSAppSyncRealTime was not received after ${CONNECTION_INIT_TIMEOUT} ms`,
						),
					);
				}
			};

			setTimeout(() => {
				checkAckOk(ackOk);
			}, CONNECTION_INIT_TIMEOUT);
		});
	}

	private _registerWebsocketHandlers(connectionTimeoutMs: number) {
		if (!this.awsRealTimeSocket) {
			return;
		}

		// Set up a keep alive heartbeat for this connection
		this.keepAliveHeartbeatIntervalId = setInterval(() => {
			this.keepAliveHeartbeat(connectionTimeoutMs);
		}, DEFAULT_KEEP_ALIVE_HEARTBEAT_TIMEOUT);

		this.awsRealTimeSocket.onmessage =
			this._handleIncomingSubscriptionMessage.bind(this);

		this.awsRealTimeSocket.onerror = err => {
			this.logger.debug(err);
			this._errorDisconnect(CONTROL_MSG.CONNECTION_CLOSED);
		};

		this.awsRealTimeSocket.onclose = event => {
			this.logger.debug(`WebSocket closed ${event.reason}`);
			this._closeSocket();
			this._errorDisconnect(CONTROL_MSG.CONNECTION_CLOSED);
		};
	}

	/**
	 * Open WebSocket connection & perform handshake
	 * Ref: https://docs.aws.amazon.com/appsync/latest/devguide/real-time-websocket-client.html#appsynclong-real-time-websocket-client-implementation-guide-for-graphql-subscriptions
	 *
	 * @param subprotocol -
	 */
	private _establishConnection = async (
		awsRealTimeUrl: string,
		subprotocol: string,
	) => {
		this.logger.debug(`Establishing WebSocket connection to ${awsRealTimeUrl}`);
		try {
			await this._openConnection(awsRealTimeUrl, subprotocol);
			await this._initiateHandshake();
		} catch (err) {
			const { errorType, errorCode } = err as {
				errorType: string;
				errorCode: number;
			};

			if (
				NON_RETRYABLE_CODES.includes(errorCode) ||
				// Event API does not currently return `errorCode`. This may change in the future.
				// For now fall back to also checking known non-retryable error types
				NON_RETRYABLE_ERROR_TYPES.includes(errorType)
			) {
				throw new NonRetryableError(errorType);
			} else if (errorType) {
				throw new Error(errorType);
			} else {
				throw err;
			}
		}
	};
}
