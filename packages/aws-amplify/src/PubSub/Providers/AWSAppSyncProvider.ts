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
import * as Observable from 'zen-observable';
import { v4 as uuid } from 'uuid';
import { ConsoleLogger as Logger } from '../../Common/Logger';

import { MqttOverWSProvider } from './MqttOverWSProvider';

const logger = new Logger('AWSAppSyncProvider');

export class AWSAppSyncProvider extends MqttOverWSProvider {

    protected get endpoint() { throw new Error('Not supported'); }

    getProviderName() { return 'AWSAppSyncProvider'; }

    public async publish(topics: string[] | string, msg: any, options?: any) {
        throw new Error('Operation not supported');
    }

    private _topicObserver: Map<string, Observable<any>> = new Map();

    subscribe(topics: string[] | string, options: any = {}): Observable<any> {
        const { mqttConnections = [] } = options;

        if (!mqttConnections.length) {
            throw new Error('Missing connections info');
        }

        logger.debug('Connections info', mqttConnections);

        // TODO: support multiple clients
        const { client: clientId, url } = mqttConnections[0];

        // re-use observers
        // this._topicObserver.
        return super.subscribe(topics, { clientId, url });
    }
}
