// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Observable, Observer, SubscriptionLike as Subscription } from 'rxjs';
import { ConsoleLogger, Hub, HubPayload } from '@aws-amplify/core';
import { amplifyUuid } from '@aws-amplify/core/internals/utils';
import mqtt, { MqttClient } from 'mqtt';

import {
	ConnectionState,
	PubSubContent,
	PubSubContentObserver,
	PubSubOptions,
	PublishInput,
	SubscribeInput,
} from '../types/PubSub';
import {
	CONNECTION_CHANGE,
	ConnectionStateMonitor,
} from '../utils/ConnectionStateMonitor';
import {
	ReconnectEvent,
	ReconnectionMonitor,
} from '../utils/ReconnectionMonitor';

import { AbstractPubSub } from './PubSub';
import { AMPLIFY_SYMBOL, CONNECTION_STATE_CHANGE } from './constants';

const logger = new ConsoleLogger('MqttOverWS');

export function mqttTopicMatch(filter: string, topic: string) {
	const filterArray = filter.split('/');
	const { length } = filterArray;
	const topicArray = topic.split('/');

	for (let i = 0; i < length; ++i) {
		const left = filterArray[i];
		const right = topicArray[i];
		if (left === '#') return topicArray.length >= length;
		if (left !== '+' && left !== right) return false;
	}

	return length === topicArray.length;
}

export interface MqttOptions extends PubSubOptions {
	clientId?: string;
	url?: string;
	endpoint?: string;
}

class ClientsQueue {
	private promises = new Map<string, Promise<MqttClient | undefined>>();

	async get(
		clientId: string,
		clientFactory?: (input: string) => Promise<MqttClient | undefined>,
	) {
		const cachedPromise = this.promises.get(clientId);
		if (cachedPromise) return cachedPromise;

		if (clientFactory) {
			const newPromise = clientFactory(clientId);
			this.promises.set(clientId, newPromise);
			newPromise.catch(() => this.promises.delete(clientId));

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

const dispatchPubSubEvent = (payload: HubPayload) => {
	Hub.dispatch('pubsub', payload, 'PubSub', AMPLIFY_SYMBOL);
};

const topicSymbol = typeof Symbol !== 'undefined' ? Symbol('topic') : '@@topic';

export class MqttOverWS extends AbstractPubSub<MqttOptions> {
	private _clientsQueue = new ClientsQueue();
	private connectionState?: ConnectionState;
	private readonly connectionStateMonitor = new ConnectionStateMonitor();
	private readonly reconnectionMonitor = new ReconnectionMonitor();

	constructor(options: MqttOptions = {}) {
		super({ ...options, clientId: options.clientId || amplifyUuid() });

		// Monitor the connection health state and pass changes along to Hub
		this.connectionStateMonitor.connectionStateObservable.subscribe(
			connectionStateChange => {
				dispatchPubSubEvent({
					event: CONNECTION_STATE_CHANGE,
					data: {
						provider: this,
						connectionState: connectionStateChange,
					},
					message: `Connection state is ${connectionStateChange}`,
				});

				this.connectionState = connectionStateChange;

				// Trigger reconnection when the connection is disrupted
				if (connectionStateChange === ConnectionState.ConnectionDisrupted) {
					this.reconnectionMonitor.record(ReconnectEvent.START_RECONNECT);
				} else if (connectionStateChange !== ConnectionState.Connecting) {
					// Trigger connected to halt reconnection attempts
					this.reconnectionMonitor.record(ReconnectEvent.HALT_RECONNECT);
				}
			},
		);
	}

	protected get clientId() {
		return this.options.clientId!;
	}

	protected get endpoint(): Promise<string | undefined> {
		return Promise.resolve(this.options.endpoint);
	}

	protected get clientsQueue() {
		return this._clientsQueue;
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

	public async newClient({
		url,
		clientId,
	}: MqttOptions): Promise<MqttClient | undefined> {
		logger.debug('Creating new MQTT client', clientId);

		this.connectionStateMonitor.record(CONNECTION_CHANGE.OPENING_CONNECTION);

		let client: MqttClient;
		try {
			client = await mqtt.connectAsync(url!, { clientId, protocolVersion: 3 });
		} catch (e) {
			if (clientId) this._clientsQueue.remove(clientId);
			this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);

			return undefined;
		}

		client.on('message', (topic, payload) => {
			this._onMessage(topic, payload.toString());
		});
		client.on('disconnect', packet => {
			const { reasonCode, properties } = packet;
			this.onDisconnect({ clientId, errorCode: reasonCode, ...properties });
			this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);
		});

		this.connectionStateMonitor.record(
			CONNECTION_CHANGE.CONNECTION_ESTABLISHED,
		);

		return client;
	}

	protected async connect(
		clientId: string,
		options: MqttOptions = {},
	): Promise<MqttClient | undefined> {
		return this.clientsQueue.get(clientId, async inputClientId => {
			const client = await this.newClient({
				...options,
				clientId: inputClientId,
			});

			if (client) {
				// Once connected, subscribe to all topics registered observers
				this._topicObservers.forEach(
					(_value: Set<PubSubContentObserver>, key: string) => {
						client.subscribe(key);
					},
				);
			}

			return client;
		});
	}

	protected async disconnect(clientId: string): Promise<void> {
		const client = await this.clientsQueue.get(clientId);

		if (client && client.connected) {
			client.end();
		}
		this.clientsQueue.remove(clientId);
		this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);
	}

	async publish({ topics, message }: PublishInput) {
		const targetTopics = ([] as string[]).concat(topics);
		const msg = JSON.stringify(message);

		const client = await this.clientsQueue.get(this.clientId);

		if (client) {
			logger.debug('Publishing to topic(s)', targetTopics.join(','), message);
			targetTopics.forEach(topic => {
				client.publish(topic, msg);
			});
		} else {
			logger.debug(
				'Publishing to topic(s) failed',
				targetTopics.join(','),
				message,
			);
		}
	}

	protected _topicObservers = new Map<string, Set<PubSubContentObserver>>();

	protected _clientIdObservers = new Map<string, Set<PubSubContentObserver>>();

	private _onMessage(topic: string, msg: string) {
		try {
			const matchedTopicObservers: Set<PubSubContentObserver>[] = [];
			this._topicObservers.forEach((observerForTopic, observerTopic) => {
				if (mqttTopicMatch(observerTopic, topic)) {
					matchedTopicObservers.push(observerForTopic);
				}
			});
			const parsedMessage: PubSubContent = JSON.parse(msg);

			if (typeof parsedMessage === 'object') {
				parsedMessage[topicSymbol] = topic;
			}

			matchedTopicObservers.forEach(observersForTopic => {
				observersForTopic.forEach(observer => {
					observer.next(parsedMessage);
				});
			});
		} catch (error) {
			logger.warn('Error handling message', error, msg);
		}
	}

	subscribe({
		topics,
		options = {},
	}: SubscribeInput & { options?: MqttOptions }): Observable<PubSubContent> {
		const targetTopics = ([] as string[]).concat(topics);
		logger.debug('Subscribing to topic(s)', targetTopics.join(','));
		let reconnectSubscription: Subscription;

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
				observersForClientId = new Set<PubSubContentObserver>();
			}
			if (observersForClientId) {
				observersForClientId.add(observer);
				this._clientIdObservers.set(clientId, observersForClientId);
			}

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
				reconnectSubscription = new Observable(
					reconnectSubscriptionObserver => {
						this.reconnectionMonitor.addObserver(reconnectSubscriptionObserver);
					},
				).subscribe(() => {
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
							CONNECTION_CHANGE.CLOSING_CONNECTION,
						);
						this._clientIdObservers.delete(clientId);
					}

					targetTopics.forEach(topic => {
						const observersForTopic =
							this._topicObservers.get(topic) ||
							(new Set() as Set<Observer<any>>);

						observersForTopic.delete(observer);

						// if no observers exists for the topic, topic should be removed
						if (observersForTopic.size === 0) {
							this._topicObservers.delete(topic);
							if (client.connected) {
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
