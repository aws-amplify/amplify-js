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
import { Client } from 'paho-mqtt';
import * as Observable from 'zen-observable';
import { ConsoleLogger as Logger } from '@aws-amplify/core';

import { MqttOverWSProvider } from './MqttOverWSProvider';

const logger = new Logger('AWSAppSyncProvider');

export class AWSAppSyncProvider extends MqttOverWSProvider {

    protected get endpoint() { throw new Error('Not supported'); }

    getProviderName() { return 'AWSAppSyncProvider'; }

    public async publish(topics: string[] | string, msg: any, options?: any) {
        throw new Error('Operation not supported');
    }

    private async disconnectAll() {
        const clientIds = this.clientsQueue.allClients;

        await Promise.all(clientIds.map(clientId => this.disconnect(clientId)));
    }

    private _cleanUp(clientId: string) {
        const toKeep = Array.from(this._topicClient.entries()).filter(([t, c]) => c.clientId !== clientId);

        this._topicClient = new Map(toKeep);
    }

    public onDisconnect({ clientId, errorCode, ...args }) {
        if (errorCode !== 0) {
            const topicsForClient = Array.from(this._topicClient.entries())
                .filter(([, c]) => c.clientId === clientId)
                .map(([t,]) => t);

            topicsForClient.forEach(topic => {
                this._topicObservers.get(topic).forEach(obs => {
                    if (!obs.closed) {
                        obs.error(args);
                    }
                });

                this._topicObservers.delete(topic);
            });

            this._cleanUp(clientId);
        }
    }

    private _topicClient: Map<string, Client> = new Map();

    protected async disconnect(clientId: string): Promise<void> {
        const client = await this.clientsQueue.get(clientId, () => null);

        await super.disconnect(clientId);

        this._cleanUp(clientId);
    }

    subscribe(topics: string[] | string, options: any = {}): Observable<any> {

        return new Observable(observer => {
            const targetTopics = ([] as string[]).concat(topics);
            logger.debug('Subscribing to topic(s)', targetTopics.join(','));

            (async () => {
                await this.disconnectAll();

                // Add these topics to map
                targetTopics.forEach(t => {
                    if (!this._topicObservers.has(t)) {
                        this._topicObservers.set(t, new Set());
                    }

                    this._topicObservers.get(t).add(observer);
                });

                const { mqttConnections = [] } = options;
                const activeTopics = Array.from(this._topicObservers.keys());

                // group by urls
                const map: [string, { url: string, topics: Set<string> }][] = Object.entries(activeTopics.reduce(
                    (acc, elem) => {
                        const connectionInfoForTopic = mqttConnections.find(c => c.topics.indexOf(elem) > -1);

                        if (connectionInfoForTopic) {
                            const { client: clientId, url } = connectionInfoForTopic;

                            if (!acc[clientId]) {
                                acc[clientId] = {
                                    url,
                                    topics: new Set(),
                                };
                            }

                            acc[clientId].topics.add(elem);
                        }

                        return acc;
                    },
                    {}
                ));

                // reconnect everything we have in the map
                await Promise.all(map.map(async ([clientId, { url, topics }]) => {
                    // connect to new client
                    const client = await this.connect(clientId, {
                        clientId,
                        url,
                    });

                    // subscribe to all topics for this client
                    // store topic-client mapping
                    topics.forEach(topic => {
                        if (client.isConnected()) {
                            client.subscribe(topic);

                            this._topicClient.set(topic, client);
                        }
                    });

                    return client;
                }));
            })();

            return () => {
                logger.debug('Unsubscribing from topic(s)', targetTopics.join(','));

                targetTopics.forEach(t => {
                    const client = this._topicClient.get(t);

                    if (client && client.isConnected()) {
                        client.unsubscribe(t);
                        this._topicClient.delete(t);

                        if (!Array.from(this._topicClient.values()).some(c => c === client)) {
                            this.disconnect(client.clientId);
                        }
                    }

                    this._topicObservers.delete(t);
                });
            };
        });
    }
}
