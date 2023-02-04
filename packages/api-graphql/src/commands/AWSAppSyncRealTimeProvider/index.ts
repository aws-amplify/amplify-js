// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import Observable, { ZenObservable } from 'zen-observable-ts';
import { v4 as uuid } from 'uuid';
import {
	SigV4HTTPRequestSigner,
	USER_AGENT_HEADER,
	jitteredExponentialRetry,
	NonRetryableError,
	isNonRetryableError,
	Amplify,
} from '@aws-amplify/core';

import {
	AWS_APPSYNC_REALTIME_HEADERS,
	CONNECTION_INIT_TIMEOUT,
	DEFAULT_KEEP_ALIVE_TIMEOUT,
	DEFAULT_KEEP_ALIVE_ALERT_TIMEOUT,
	MAX_DELAY_MS,
	MESSAGE_TYPES,
	NON_RETRYABLE_CODES,
	SOCKET_STATUS,
	START_ACK_TIMEOUT,
	SUBSCRIPTION_STATUS,
	CONNECTION_STATE_CHANGE,
} from '../utils/constants';

import {
	ConnectionStateMonitor,
	CONNECTION_CHANGE,
} from '../utils/ConnectionStateMonitor';
import {
	ReconnectEvent,
	ReconnectionMonitor,
} from '../utils/ReconnectionMonitor';
import { ConnectionState, CONTROL_MSG, GRAPHQL_AUTH_MODE } from '../../types';

const dispatchApiEvent = (event: string, data: any, message: string) => {};

export type ObserverQuery = {
	observer: ZenObservable.SubscriptionObserver<any>;
	query: string;
	variables: object;
	subscriptionState: SUBSCRIPTION_STATUS;
	subscriptionReadyCallback?: Function;
	subscriptionFailedCallback?: Function;
	startAckTimeoutId?: ReturnType<typeof setTimeout>;
};

const standardDomainPattern =
	/^https:\/\/\w{26}\.appsync\-api\.\w{2}(?:(?:\-\w{2,})+)\-\d\.amazonaws.com(?:\.cn)?\/graphql$/i;

const customDomainPath = '/realtime';

type GraphqlAuthModes = keyof typeof GRAPHQL_AUTH_MODE;

export interface AWSAppSyncRealTimeProviderOptions extends ProviderOptions {
	appSyncGraphqlEndpoint?: string;
	authenticationType?: GraphqlAuthModes;
	query?: string;
	variables?: object;
	apiKey?: string;
	region?: string;
	graphql_headers?: () => {} | (() => Promise<{}>);
	additionalHeaders?: { [key: string]: string };
}

type AWSAppSyncRealTimeAuthInput =
	Partial<AWSAppSyncRealTimeProviderOptions> & {
		canonicalUri: string;
		payload: string;
	};

interface ProviderOptions {
	[key: string]: any;
}

export class AWSAppSyncRealTimeProvider {
	private awsRealTimeSocket?: WebSocket;
	private socketStatus: SOCKET_STATUS = SOCKET_STATUS.CLOSED;
	private keepAliveTimeoutId?: ReturnType<typeof setTimeout>;
	private keepAliveTimeout = DEFAULT_KEEP_ALIVE_TIMEOUT;
	private keepAliveAlertTimeoutId?: ReturnType<typeof setTimeout>;
	private subscriptionObserverMap: Map<string, ObserverQuery> = new Map();
	private promiseArray: Array<{ res: Function; rej: Function }> = [];
	private connectionState: ConnectionState;
	private readonly connectionStateMonitor = new ConnectionStateMonitor();
	private readonly reconnectionMonitor = new ReconnectionMonitor();
	private connectionStateMonitorSubscription: ZenObservable.Subscription;
	private options: any;
	constructor(options: ProviderOptions = {}) {
		this.options = options;
		// Monitor the connection state and pass changes along to Hub
		this.connectionStateMonitorSubscription =
			this.connectionStateMonitor.connectionStateObservable.subscribe(
				connectionState => {
					dispatchApiEvent(
						CONNECTION_STATE_CHANGE,
						{
							provider: this,
							connectionState,
						},
						`Connection state is ${connectionState}`
					);
					this.connectionState = connectionState;

					// Trigger START_RECONNECT when the connection is disrupted
					if (connectionState === ConnectionState.ConnectionDisrupted) {
						this.reconnectionMonitor.record(ReconnectEvent.START_RECONNECT);
					}

					// Trigger HALT_RECONNECT to halt reconnection attempts when the state is anything other than
					//   ConnectionDisrupted or Connecting
					if (
						[
							ConnectionState.Connected,
							ConnectionState.ConnectedPendingDisconnect,
							ConnectionState.ConnectedPendingKeepAlive,
							ConnectionState.ConnectedPendingNetwork,
							ConnectionState.ConnectedPendingNetwork,
							ConnectionState.ConnectionDisruptedPendingNetwork,
							ConnectionState.Disconnected,
						].includes(connectionState)
					) {
						this.reconnectionMonitor.record(ReconnectEvent.HALT_RECONNECT);
					}
				}
			);
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
	}

	getNewWebSocket(url, protocol) {
		return new WebSocket(url, protocol);
	}

	getProviderName() {
		return 'AWSAppSyncRealTimeProvider';
	}

	newClient(): Promise<any> {
		throw new Error('Not used here');
	}

	public async publish(_topics: string[] | string, _msg: any, _options?: any) {
		throw new Error('Operation not supported');
	}

	// Check if url matches standard domain pattern
	private isCustomDomain(url: string): boolean {
		return url.match(standardDomainPattern) === null;
	}

	subscribe(
		_topics: string[] | string,
		options?: AWSAppSyncRealTimeProviderOptions
	): Observable<any> {
		const appSyncGraphqlEndpoint = options?.appSyncGraphqlEndpoint;

		return new Observable(observer => {
			if (!options || !appSyncGraphqlEndpoint) {
				observer.error({
					errors: [
						{
							...new Error(`Subscribe only available for AWS AppSync endpoint`),
						},
					],
				});
				observer.complete();
			} else {
				let subscriptionStartActive = false;
				const subscriptionId = uuid();
				const startSubscription = () => {
					if (!subscriptionStartActive) {
						subscriptionStartActive = true;
						const startSubscriptionPromise =
							this._startSubscriptionWithAWSAppSyncRealTime({
								options,
								observer,
								subscriptionId,
							}).catch<any>(err => {
								this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);
							});
						startSubscriptionPromise.finally(() => {
							subscriptionStartActive = false;
						});
					}
				};

				let reconnectSubscription: ZenObservable.Subscription;

				// Add an observable to the reconnection list to manage reconnection for this subscription
				reconnectSubscription = new Observable(observer => {
					this.reconnectionMonitor.addObserver(observer);
				}).subscribe(() => {
					startSubscription();
				});

				startSubscription();

				return async () => {
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
					} finally {
						this._removeSubscriptionObserver(subscriptionId);
					}
				};
			}
		});
	}

	protected get isSSLEnabled() {
		return !this.options
			.aws_appsync_dangerously_connect_to_http_endpoint_for_testing;
	}

	private async _startSubscriptionWithAWSAppSyncRealTime({
		options,
		observer,
		subscriptionId,
	}: {
		options: AWSAppSyncRealTimeProviderOptions;
		observer: ZenObservable.SubscriptionObserver<any>;
		subscriptionId: string;
	}) {
		const {
			appSyncGraphqlEndpoint,
			authenticationType,
			query,
			variables,
			apiKey,
			region,
			graphql_headers = () => ({}),
			additionalHeaders = {},
		} = options;

		const subscriptionState: SUBSCRIPTION_STATUS = SUBSCRIPTION_STATUS.PENDING;
		const data = {
			query,
			variables,
		};
		// Having a subscription id map will make it simple to forward messages received
		this.subscriptionObserverMap.set(subscriptionId, {
			observer,
			query: query ?? '',
			variables: variables ?? {},
			subscriptionState,
			startAckTimeoutId: undefined,
		});

		// Preparing payload for subscription message

		const dataString = JSON.stringify(data);
		const headerObj = {
			...(await this._awsRealTimeHeaderBasedAuth({
				apiKey,
				appSyncGraphqlEndpoint,
				authenticationType,
				payload: dataString,
				canonicalUri: '',
				region,
				additionalHeaders,
			})),
			...(await graphql_headers()),
			...additionalHeaders,
			[USER_AGENT_HEADER]: 'amplify test',
		};

		const subscriptionMessage = {
			id: subscriptionId,
			payload: {
				data: dataString,
				extensions: {
					authorization: {
						...headerObj,
					},
				},
			},
			type: MESSAGE_TYPES.GQL_START,
		};

		const stringToAWSRealTime = JSON.stringify(subscriptionMessage);

		try {
			this.connectionStateMonitor.record(CONNECTION_CHANGE.OPENING_CONNECTION);
			await this._initializeWebSocketConnection({
				apiKey,
				appSyncGraphqlEndpoint,
				authenticationType,
				region,
				additionalHeaders,
			});
		} catch (err) {
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
			subscriptionState,
			query: query ?? '',
			variables: variables ?? {},
			subscriptionReadyCallback,
			subscriptionFailedCallback,
			startAckTimeoutId: setTimeout(() => {
				this._timeoutStartSubscriptionAck.call(this, subscriptionId);
			}, START_ACK_TIMEOUT),
		});
		if (this.awsRealTimeSocket) {
			this.awsRealTimeSocket.send(stringToAWSRealTime);
		}
	}

	// Log logic for start subscription failures
	private _logStartSubscriptionError(subscriptionId, observer, err) {
		const message = err['message'] ?? '';
		// Resolving to give the state observer time to propogate the update
		Promise.resolve(
			this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED)
		);

		// Capture the error only when the network didn't cause disruption
		if (
			this.connectionState !== ConnectionState.ConnectionDisruptedPendingNetwork
		) {
			// When the error is non-retriable, error out the observable
			if (isNonRetryableError(err)) {
				observer.error({
					errors: [
						{
							...new Error(`${CONTROL_MSG.CONNECTION_FAILED}: ${message}`),
						},
					],
				});
			} else {
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
				return new Promise((res, rej) => {
					const { observer, subscriptionState, variables, query } =
						subscriptionObserver;
					this.subscriptionObserverMap.set(subscriptionId, {
						observer,
						subscriptionState,
						variables,
						query,
						subscriptionReadyCallback: res,
						subscriptionFailedCallback: rej,
					});
				});
			}
		}
	}

	private _sendUnsubscriptionMessage(subscriptionId: string) {
		try {
			if (
				this.awsRealTimeSocket &&
				this.awsRealTimeSocket.readyState === WebSocket.OPEN &&
				this.socketStatus === SOCKET_STATUS.READY
			) {
				// Preparing unsubscribe message to stop receiving messages for that subscription
				const unsubscribeMessage = {
					id: subscriptionId,
					type: MESSAGE_TYPES.GQL_STOP,
				};
				const stringToAWSRealTime = JSON.stringify(unsubscribeMessage);
				this.awsRealTimeSocket.send(stringToAWSRealTime);
			}
		} catch (err) {
			// If GQL_STOP is not sent because of disconnection issue, then there is nothing the client can do
		}
	}

	private _removeSubscriptionObserver(subscriptionId: string) {
		this.subscriptionObserverMap.delete(subscriptionId);

		// Verifying 1000ms after removing subscription in case there are new subscription unmount/mount
		setTimeout(this._closeSocketIfRequired.bind(this), 1000);
	}

	private _closeSocketIfRequired() {
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
			if (this.keepAliveTimeoutId) {
				clearTimeout(this.keepAliveTimeoutId);
			}
			if (this.keepAliveAlertTimeoutId) {
				clearTimeout(this.keepAliveAlertTimeoutId);
			}
			const tempSocket = this.awsRealTimeSocket;
			// Cleaning callbacks to avoid race condition, socket still exists
			tempSocket.onclose = null;
			tempSocket.onerror = null;
			tempSocket.close(1000);
			this.awsRealTimeSocket = undefined;
			this.socketStatus = SOCKET_STATUS.CLOSED;
			this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);
		}
	}

	private _handleIncomingSubscriptionMessage(message: MessageEvent) {
		const { id = '', payload, type } = JSON.parse(message.data);
		const {
			observer = null,
			query = '',
			variables = {},
			startAckTimeoutId,
			subscriptionReadyCallback,
			subscriptionFailedCallback,
		} = this.subscriptionObserverMap.get(id) || {};

		if (type === MESSAGE_TYPES.GQL_DATA && payload && payload.data) {
			if (observer) {
				observer.next(payload);
			} else {
			}
			return;
		}

		if (type === MESSAGE_TYPES.GQL_START_ACK) {
			if (typeof subscriptionReadyCallback === 'function') {
				subscriptionReadyCallback();
			}
			if (startAckTimeoutId) clearTimeout(startAckTimeoutId);
			dispatchApiEvent(
				CONTROL_MSG.SUBSCRIPTION_ACK,
				{ query, variables },
				'Connection established for subscription'
			);
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
				CONNECTION_CHANGE.CONNECTION_ESTABLISHED
			);

			return;
		}

		if (type === MESSAGE_TYPES.GQL_CONNECTION_KEEP_ALIVE) {
			if (this.keepAliveTimeoutId) clearTimeout(this.keepAliveTimeoutId);
			if (this.keepAliveAlertTimeoutId)
				clearTimeout(this.keepAliveAlertTimeoutId);
			this.keepAliveTimeoutId = setTimeout(
				() => this._errorDisconnect(CONTROL_MSG.TIMEOUT_DISCONNECT),
				this.keepAliveTimeout
			);
			this.keepAliveAlertTimeoutId = setTimeout(() => {
				this.connectionStateMonitor.record(CONNECTION_CHANGE.KEEP_ALIVE_MISSED);
			}, DEFAULT_KEEP_ALIVE_ALERT_TIMEOUT);
			this.connectionStateMonitor.record(CONNECTION_CHANGE.KEEP_ALIVE);
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

				observer.error({
					errors: [
						{
							...new Error(
								`${CONTROL_MSG.CONNECTION_FAILED}: ${JSON.stringify(payload)}`
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
		if (this.awsRealTimeSocket) {
			this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);
			this.awsRealTimeSocket.close();
		}

		this.socketStatus = SOCKET_STATUS.CLOSED;
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

			this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);
		}
	}

	private _initializeWebSocketConnection({
		appSyncGraphqlEndpoint,
		authenticationType,
		apiKey,
		region,
		additionalHeaders,
	}: AWSAppSyncRealTimeProviderOptions) {
		if (this.socketStatus === SOCKET_STATUS.READY) {
			return;
		}
		return new Promise(async (res, rej) => {
			this.promiseArray.push({ res, rej });

			if (this.socketStatus === SOCKET_STATUS.CLOSED) {
				try {
					this.socketStatus = SOCKET_STATUS.CONNECTING;

					const payloadString = '{}';
					const headerString = JSON.stringify(
						await this._awsRealTimeHeaderBasedAuth({
							authenticationType,
							payload: payloadString,
							canonicalUri: '/connect',
							apiKey,
							appSyncGraphqlEndpoint,
							region,
							additionalHeaders,
						})
					);
					const headerQs = window.btoa(headerString);
					const payloadQs = window.btoa(payloadString);

					let discoverableEndpoint = appSyncGraphqlEndpoint ?? '';

					if (this.isCustomDomain(discoverableEndpoint)) {
						discoverableEndpoint =
							discoverableEndpoint.concat(customDomainPath);
					} else {
						discoverableEndpoint = discoverableEndpoint
							.replace('appsync-api', 'appsync-realtime-api')
							.replace('gogi-beta', 'grt-beta');
					}

					// Creating websocket url with required query strings
					const protocol = this.isSSLEnabled ? 'wss://' : 'ws://';
					discoverableEndpoint = discoverableEndpoint
						.replace('https://', protocol)
						.replace('http://', protocol);

					const awsRealTimeUrl = `${discoverableEndpoint}?header=${headerQs}&payload=${payloadQs}`;

					await this._initializeRetryableHandshake(awsRealTimeUrl);

					this.promiseArray.forEach(({ res }) => {
						res();
					});
					this.socketStatus = SOCKET_STATUS.READY;
					this.promiseArray = [];
				} catch (err) {
					this.promiseArray.forEach(({ rej }) => rej(err));
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

	private async _initializeRetryableHandshake(awsRealTimeUrl: string) {
		await jitteredExponentialRetry(
			this._initializeHandshake.bind(this),
			[awsRealTimeUrl],
			MAX_DELAY_MS
		);
	}

	private async _initializeHandshake(awsRealTimeUrl: string) {
		// Because connecting the socket is async, is waiting until connection is open
		// Step 1: connect websocket
		try {
			await (() => {
				return new Promise<void>((res, rej) => {
					const newSocket = this.getNewWebSocket(awsRealTimeUrl, 'graphql-ws');
					newSocket.onerror = () => {};
					newSocket.onclose = () => {
						rej(new Error('Connection handshake error'));
					};
					newSocket.onopen = () => {
						this.awsRealTimeSocket = newSocket;
						return res();
					};
				});
			})();
			// Step 2: wait for ack from AWS AppSyncReaTime after sending init
			await (() => {
				return new Promise((res, rej) => {
					if (this.awsRealTimeSocket) {
						let ackOk = false;
						this.awsRealTimeSocket.onerror = error => {};
						this.awsRealTimeSocket.onclose = event => {
							rej(new Error(JSON.stringify(event)));
						};

						this.awsRealTimeSocket.onmessage = (message: MessageEvent) => {
							const data = JSON.parse(message.data);
							const {
								type,
								payload: {
									connectionTimeoutMs = DEFAULT_KEEP_ALIVE_TIMEOUT,
								} = {},
							} = data;
							if (type === MESSAGE_TYPES.GQL_CONNECTION_ACK) {
								ackOk = true;
								if (this.awsRealTimeSocket) {
									this.keepAliveTimeout = connectionTimeoutMs;
									this.awsRealTimeSocket.onmessage =
										this._handleIncomingSubscriptionMessage.bind(this);
									this.awsRealTimeSocket.onerror = err => {
										this._errorDisconnect(CONTROL_MSG.CONNECTION_CLOSED);
									};
									this.awsRealTimeSocket.onclose = event => {
										this._errorDisconnect(CONTROL_MSG.CONNECTION_CLOSED);
									};
								}
								res('Cool, connected to AWS AppSyncRealTime');
								return;
							}

							if (type === MESSAGE_TYPES.GQL_CONNECTION_ERROR) {
								const {
									payload: {
										errors: [{ errorType = '', errorCode = 0 } = {}] = [],
									} = {},
								} = data;

								rej({ errorType, errorCode });
							}
						};

						const gqlInit = {
							type: MESSAGE_TYPES.GQL_CONNECTION_INIT,
						};
						this.awsRealTimeSocket.send(JSON.stringify(gqlInit));

						const checkAckOk = (ackOk: boolean) => {
							if (!ackOk) {
								this.connectionStateMonitor.record(
									CONNECTION_CHANGE.CONNECTION_FAILED
								);
								rej(
									new Error(
										`Connection timeout: ack from AWSAppSyncRealTime was not received after ${CONNECTION_INIT_TIMEOUT} ms`
									)
								);
							}
						};

						setTimeout(() => checkAckOk(ackOk), CONNECTION_INIT_TIMEOUT);
					}
				});
			})();
		} catch (err) {
			const { errorType, errorCode } = err as {
				errorType: string;
				errorCode: number;
			};

			if (NON_RETRYABLE_CODES.includes(errorCode)) {
				throw new NonRetryableError(errorType);
			} else if (errorType) {
				throw new Error(errorType);
			} else {
				throw err;
			}
		}
	}

	private async _awsRealTimeHeaderBasedAuth({
		authenticationType,
		payload,
		canonicalUri,
		appSyncGraphqlEndpoint,
		apiKey,
		region,
		additionalHeaders,
	}: AWSAppSyncRealTimeProviderOptions): Promise<any> {
		const headerHandler: {
			[key in GraphqlAuthModes]: (AWSAppSyncRealTimeAuthInput) => {};
		} = {
			API_KEY: this._awsRealTimeApiKeyHeader.bind(this),
			AWS_IAM: this._awsRealTimeIAMHeader.bind(this),
			OPENID_CONNECT: this._awsRealTimeOPENIDHeader.bind(this),
			AMAZON_COGNITO_USER_POOLS: this._awsRealTimeCUPHeader.bind(this),
			AWS_LAMBDA: this._customAuthHeader,
		};

		if (!authenticationType || !headerHandler[authenticationType]) {
			return '';
		} else {
			const handler = headerHandler[authenticationType];
			const host = new URL(appSyncGraphqlEndpoint ?? '').host;

			const result = await handler({
				payload,
				canonicalUri,
				appSyncGraphqlEndpoint,
				apiKey,
				region,
				host,
				additionalHeaders,
			});

			return result;
		}
	}

	private async _awsRealTimeCUPHeader({ host }: AWSAppSyncRealTimeAuthInput) {
		const session = Amplify.getUser();
		return {
			Authorization: session.accessToken,
			host,
		};
	}

	private async _awsRealTimeOPENIDHeader({
		host,
	}: AWSAppSyncRealTimeAuthInput) {
		let token;
		// backwards compatibility
		const federatedInfo = Amplify.getUser().accessToken;
		if (federatedInfo) {
			token = federatedInfo;
		} else {
			const currentUser = Amplify.getUser();
			if (currentUser) {
				token = currentUser.accessToken;
			}
		}
		if (!token) {
			throw new Error('No federated jwt');
		}
		return {
			Authorization: token,
			host,
		};
	}

	private async _awsRealTimeApiKeyHeader({
		apiKey,
		host,
	}: AWSAppSyncRealTimeAuthInput) {
		const dt = new Date();
		const dtStr = dt.toISOString().replace(/[:\-]|\.\d{3}/g, '');

		return {
			host,
			'x-amz-date': dtStr,
			'x-api-key': apiKey,
		};
	}

	private async _awsRealTimeIAMHeader({
		payload,
		canonicalUri,
		appSyncGraphqlEndpoint,
		region,
	}: AWSAppSyncRealTimeAuthInput) {
		const endpointInfo = {
			region,
			service: 'appsync',
		};

		const credentialsOK = await this._ensureCredentials();
		if (!credentialsOK) {
			throw new Error('No credentials');
		}
		const user = Amplify.getUser();
		const creds = {
			secret_key: user.awsCreds?.secretKey,
			access_key: user.awsCreds?.accessKey,
			session_token: user.awsCreds?.sessionToken,
		};

		const request = {
			url: `${appSyncGraphqlEndpoint}${canonicalUri}`,
			data: payload,
			method: 'POST',
			headers: { ...AWS_APPSYNC_REALTIME_HEADERS },
		};

		const signed_params = SigV4HTTPRequestSigner(request, creds, endpointInfo);
		return signed_params.headers;
	}

	private _customAuthHeader({
		host,
		additionalHeaders,
	}: AWSAppSyncRealTimeAuthInput) {
		if (!additionalHeaders || !additionalHeaders['Authorization']) {
			throw new Error('No auth token specified');
		}

		return {
			Authorization: additionalHeaders.Authorization,
			host,
		};
	}

	/**
	 * @private
	 */
	_ensureCredentials() {
		return !!Amplify.getUser().awsCreds;
	}
}
