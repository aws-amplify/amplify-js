// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as Paho from 'paho-mqtt';
import { v4 as uuid } from 'uuid';
import Observable, { ZenObservable } from 'zen-observable-ts';

import { AbstractPubSubProvider } from './PubSubProvider';
import { SubscriptionObserver, ConnectionState } from '../types/PubSub';
import { ProviderOptions } from '../types/Provider';
import { ConsoleLogger as Logger, Hub } from '@aws-amplify/core';
import {
	ConnectionStateMonitor,
	CONNECTION_CHANGE,
} from '../utils/ConnectionStateMonitor';
import {
	ReconnectEvent,
	ReconnectionMonitor,
} from '../utils/ReconnectionMonitor';
import { AMPLIFY_SYMBOL, CONNECTION_STATE_CHANGE } from './constants';

const logger = new Logger('MqttOverWSProvider');

export function mqttTopicMatch(filter: string, topic: string) {
	const filterArray = filter.split('/');
	const length = filterArray.length;
	const topicArray = topic.split('/');

	for (let i = 0; i < length; ++i) {
		const left = filterArray[i];
		const right = topicArray[i];
		if (left === '#') return topicArray.length >= length;
		if (left !== '+' && left !== right) return false;
	}
	return length === topicArray.length;
}

export interface MqttProviderOptions extends ProviderOptions {
	clientId?: string;
	url?: string;
}

class ClientsQueue {
	private promises: Map<string, Promise<any>> = new Map();

	async get(clientId: string, clientFactory?: (input: string) => Promise<any>) {
		const cachedPromise = this.promises.get(clientId);
		if (cachedPromise) return cachedPromise;

		if (clientFactory) {
			const newPromise = clientFactory(clientId);
			this.promises.set(clientId, newPromise);
			newPromise.catch(v => this.promises.delete(clientId));
			return newPromise;
		}

		return undefined;
	}

	get allClients() {
		return Array.from(this.promises.keys());
	}

	remove(clientId: string) {
		this.promises.delete(clientId);
	}
}

const dispatchPubSubEvent = (event: string, data: any, message: string) => {
	Hub.dispatch('pubsub', { event, data, message }, 'PubSub', AMPLIFY_SYMBOL);
};

const topicSymbol = typeof Symbol !== 'undefined' ? Symbol('topic') : '@@topic';

export class MqttOverWSProvider extends AbstractPubSubProvider {
	private _clientsQueue = new ClientsQueue();
	private connectionState: ConnectionState;
	private readonly connectionStateMonitor = new ConnectionStateMonitor();
	private readonly reconnectionMonitor = new ReconnectionMonitor();

	constructor(options: MqttProviderOptions = {}) {
		super({ ...options, clientId: options.clientId || uuid() });

		// Monitor the connection health state and pass changes along to Hub
		this.connectionStateMonitor.connectionStateObservable.subscribe(
			connectionStateChange => {
				dispatchPubSubEvent(
					CONNECTION_STATE_CHANGE,
					{
						provider: this,
						connectionState: connectionStateChange,
					},
					`Connection state is ${connectionStateChange}`
				);

				this.connectionState = connectionStateChange;

				// Trigger reconnection when the connection is disrupted
				if (connectionStateChange === ConnectionState.ConnectionDisrupted) {
					this.reconnectionMonitor.record(ReconnectEvent.START_RECONNECT);
				} else if (connectionStateChange !== ConnectionState.Connecting) {
					// Trigger connected to halt reconnection attempts
					this.reconnectionMonitor.record(ReconnectEvent.HALT_RECONNECT);
				}
			}
		);
	}

	protected get clientId() {
		return this.options.clientId;
	}

	protected get endpoint() {
		return this.options.aws_pubsub_endpoint;
	}

	protected get clientsQueue() {
		return this._clientsQueue;
	}

	protected get isSSLEnabled() {
		return !this.options
			.aws_appsync_dangerously_connect_to_http_endpoint_for_testing;
	}

	protected getTopicForValue(value: any) {
		return typeof value === 'object' && value[topicSymbol];
	}

	getProviderName() {
		return 'MqttOverWSProvider';
	}

	public onDisconnect({
		clientId,
		errorCode,
		...args
	}: {
		clientId?: string;
		errorCode?: number;
	}) {
		if (errorCode !== 0) {
			logger.warn(clientId, JSON.stringify({ errorCode, ...args }, null, 2));

			if (!clientId) {
				return;
			}
			const clientIdObservers = this._clientIdObservers.get(clientId);
			if (!clientIdObservers) {
				return;
			}
			this.disconnect(clientId);
		}
	}

	public async newClient({ url, clientId }: MqttProviderOptions): Promise<any> {
		logger.debug('Creating new MQTT client', clientId);

		this.connectionStateMonitor.record(CONNECTION_CHANGE.OPENING_CONNECTION);
		// @ts-ignore
		const client = new Paho.Client(url, clientId);

		client.onMessageArrived = ({
			destinationName: topic,
			payloadString: msg,
		}: {
			destinationName: string;
			payloadString: string;
		}) => {
			this._onMessage(topic, msg);
		};
		client.onConnectionLost = ({
			errorCode,
			...args
		}: {
			errorCode: number;
		}) => {
			this.onDisconnect({ clientId, errorCode, ...args });
			this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);
		};

		const connected = await new Promise((resolve, reject) => {
			client.connect({
				useSSL: this.isSSLEnabled,
				mqttVersion: 3,
				onSuccess: () => resolve(true),
				onFailure: x => {
					if (clientId) this._clientsQueue.remove(clientId);
					this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);
					resolve(false);
				},
			});
		});

		if (connected) {
			this.connectionStateMonitor.record(
				CONNECTION_CHANGE.CONNECTION_ESTABLISHED
			);
		}

		return client;
	}

	protected async connect(
		clientId: string,
		options: MqttProviderOptions = {}
	): Promise<any> {
		return await this.clientsQueue.get(clientId, async clientId => {
			const client = await this.newClient({ ...options, clientId });

			if (client) {
				// Once connected, subscribe to all topics registered observers
				this._topicObservers.forEach(
					(_value: Set<SubscriptionObserver<any>>, key: string) => {
						client.subscribe(key);
					}
				);
			}
			return client;
		});
	}

	protected async disconnect(clientId: string): Promise<void> {
		const client = await this.clientsQueue.get(clientId);

		if (client && client.isConnected()) {
			client.disconnect();
		}
		this.clientsQueue.remove(clientId);
		this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);
	}

	async publish(topics: string[] | string, msg: any) {
		const targetTopics = ([] as string[]).concat(topics);
		const message = JSON.stringify(msg);

		const client = await this.clientsQueue.get(this.clientId);

		if (client) {
			logger.debug('Publishing to topic(s)', targetTopics.join(','), message);
			targetTopics.forEach(topic => client.send(topic, message));
		} else {
			logger.debug(
				'Publishing to topic(s) failed',
				targetTopics.join(','),
				message
			);
		}
	}

	protected _topicObservers: Map<string, Set<SubscriptionObserver<any>>> =
		new Map();

	protected _clientIdObservers: Map<string, Set<SubscriptionObserver<any>>> =
		new Map();

	private _onMessage(topic: string, msg: any) {
		try {
			const matchedTopicObservers: Set<SubscriptionObserver<any>>[] = [];
			this._topicObservers.forEach((observerForTopic, observerTopic) => {
				if (mqttTopicMatch(observerTopic, topic)) {
					matchedTopicObservers.push(observerForTopic);
				}
			});
			const parsedMessage = JSON.parse(msg);

			if (typeof parsedMessage === 'object') {
				parsedMessage[topicSymbol] = topic;
			}

			matchedTopicObservers.forEach(observersForTopic => {
				observersForTopic.forEach(observer => observer.next(parsedMessage));
			});
		} catch (error) {
			logger.warn('Error handling message', error, msg);
		}
	}

	subscribe(
		topics: string[] | string,
		options: MqttProviderOptions = {}
	): Observable<any> {
		const targetTopics = ([] as string[]).concat(topics);
		logger.debug('Subscribing to topic(s)', targetTopics.join(','));
		let reconnectSubscription: ZenObservable.Subscription;

		return new Observable(observer => {
			targetTopics.forEach(topic => {
				// this._topicObservers is used to notify the observers according to the topic received on the message
				let observersForTopic = this._topicObservers.get(topic);

				if (!observersForTopic) {
					observersForTopic = new Set();

					this._topicObservers.set(topic, observersForTopic);
				}

				observersForTopic.add(observer);
			});

			const { clientId = this.clientId } = options;

			// this._clientIdObservers is used to close observers when client gets disconnected
			let observersForClientId = this._clientIdObservers.get(clientId);
			if (!observersForClientId) {
				observersForClientId = new Set();
			}
			observersForClientId.add(observer);
			this._clientIdObservers.set(clientId, observersForClientId);

			(async () => {
				const getClient = async () => {
					try {
						const { url = await this.endpoint } = options;
						const client = await this.connect(clientId, { url });
						if (client !== undefined) {
							targetTopics.forEach(topic => {
								client.subscribe(topic);
							});
						}
					} catch (e) {
						logger.debug('Error forming connection', e);
					}
				};

				// Establish the initial connection
				await getClient();

				// Add an observable to the reconnection list to manage reconnection for this subscription
				reconnectSubscription = new Observable(observer => {
					this.reconnectionMonitor.addObserver(observer);
				}).subscribe(() => {
					getClient();
				});
			})();

			return async () => {
				const client = await this.clientsQueue.get(clientId);

				reconnectSubscription?.unsubscribe();

				if (client) {
					this._clientIdObservers.get(clientId)?.delete(observer);
					// No more observers per client => client not needed anymore
					if (this._clientIdObservers.get(clientId)?.size === 0) {
						this.disconnect(clientId);
						this.connectionStateMonitor.record(
							CONNECTION_CHANGE.CLOSING_CONNECTION
						);
						this._clientIdObservers.delete(clientId);
					}

					targetTopics.forEach(topic => {
						const observersForTopic =
							this._topicObservers.get(topic) ||
							(new Set() as Set<SubscriptionObserver<any>>);

						observersForTopic.delete(observer);

						// if no observers exists for the topic, topic should be removed
						if (observersForTopic.size === 0) {
							this._topicObservers.delete(topic);
							if (client.isConnected()) {
								client.unsubscribe(topic);
							}
						}
					});
				}

				return null;
			};
		});
	}
}
