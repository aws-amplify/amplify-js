/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import { Client, Message } from 'paho-mqtt';
import { v4 as uuid } from 'uuid';
import * as Observable from 'zen-observable';

(<any>global).Paho = (<any>global).Paho || { MQTT: { Client, Message } };

import { AbstractPubSubProvider } from './PubSubProvider';
import { ProvidertOptions } from '../types';
import { ConsoleLogger as Logger } from '@aws-amplify/core';

const logger = new Logger('MqttOverWSProvider');

export interface MqttProvidertOptions extends ProvidertOptions {
    clientId?: string,
    url?: string,
}

class ClientsQueue {
    private promises: Map<string, Promise<Client>> = new Map();

    async get(clientId: string, clientFactory: (string) => Promise<Client>) {
        let promise = this.promises.get(clientId);
        if (promise) {
            return promise;
        }

        promise = clientFactory(clientId);

        this.promises.set(clientId, promise);

        return promise;
    }

    get allClients() { return Array.from(this.promises.keys()); }

    remove(clientId) {
        this.promises.delete(clientId);
    }
}

export class MqttOverWSProvider extends AbstractPubSubProvider {

    private _clientsQueue = new ClientsQueue();

    constructor(options: MqttProvidertOptions = {}) {
        super({ ...options, clientId: options.clientId || uuid(), });
    }

    protected get clientId() { return this.options.clientId; }

    protected get endpoint() { return this.options.aws_pubsub_endpoint; }

    protected get clientsQueue() { return this._clientsQueue; }

    getProviderName() { return 'MqttOverWSProvider'; }

    public onDisconnect({ clientId, errorCode, ...args }) {
        if (errorCode !== 0) {
            logger.warn(clientId, JSON.stringify({ errorCode, ...args }, null, 2));
        }
    }

    public async newClient({ url, clientId }: MqttProvidertOptions): Promise<Client> {
        logger.debug('Creating new MQTT client', clientId);

        const client = new Client(url, clientId);
        // client.trace = (args) => logger.debug(clientId, JSON.stringify(args, null, 2));
        client.onMessageArrived = ({ destinationName: topic, payloadString: msg }) => {
            this._onMessage(topic, msg);
        };
        client.onConnectionLost = ({ errorCode, ...args }) => {
            this.onDisconnect({ clientId, errorCode, ...args });
        };

        await new Promise((resolve, reject) => {
            client.connect({
                useSSL: true,
                mqttVersion: 3,
                onSuccess: () => resolve(client),
                onFailure: reject,
            });
        });

        return client;
    }

    protected async connect(clientId: string, options: MqttProvidertOptions = {}): Promise<Client> {
        return await this.clientsQueue.get(clientId, clientId => this.newClient({ ...options, clientId }));
    }

    protected async disconnect(clientId: string): Promise<void> {
        const client = await this.clientsQueue.get(clientId, () => null);

        if (client && client.isConnected()) {
            client.disconnect();
        }
        this.clientsQueue.remove(clientId);
    }

    async publish(topics: string[] | string, msg: any) {
        const targetTopics = ([] as string[]).concat(topics);
        const message = JSON.stringify(msg);

        const url = await this.endpoint;

        const client = await this.connect(this.clientId, { url });

        logger.debug('Publishing to topic(s)', targetTopics.join(','), message);
        targetTopics.forEach(topic => client.send(topic, message));
    }

    protected _topicObservers: Map<string, Set<ZenObservable.SubscriptionObserver<any>>> = new Map();

    private _onMessage(topic: string, msg: any) {
        try {
            const observersForTopic = this._topicObservers.get(topic) || new Set();
            const parsedMessage = JSON.parse(msg);

            observersForTopic.forEach(observer => observer.next(parsedMessage));
        } catch (error) {
            logger.warn('Error handling message', error, msg);
        }
    }

    subscribe(topics: string[] | string, options: MqttProvidertOptions = {}): Observable<any> {
        const targetTopics = ([] as string[]).concat(topics);
        logger.debug('Subscribing to topic(s)', targetTopics.join(','));

        return new Observable(observer => {

            targetTopics.forEach(topic => {
                let observersForTopic = this._topicObservers.get(topic);

                if (!observersForTopic) {
                    observersForTopic = new Set();

                    this._topicObservers.set(topic, observersForTopic);
                }

                observersForTopic.add(observer);
            });

            let client: Client;
            const { clientId = this.clientId } = options;

            (async () => {
                const {
                    url = await this.endpoint,
                } = options;

                client = await this.connect(clientId, { url });
                targetTopics.forEach(topic => { client.subscribe(topic); });
            })();

            return () => {
                logger.debug('Unsubscribing from topic(s)', targetTopics.join(','));

                if (client) {
                    targetTopics.forEach(topic => {
                        if (client.isConnected()) {
                            client.unsubscribe(topic);
                        }

                        const observersForTopic = this._topicObservers.get(topic) ||
                            (new Set() as Set<ZenObservable.SubscriptionObserver<any>>);

                        observersForTopic.forEach(observer => observer.complete());

                        observersForTopic.clear();
                    });

                    this.disconnect(clientId);
                }

                return null;
            };
        });
    }
}
