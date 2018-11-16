/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { ConsoleLogger as Logger } from './Logger';

const logger = new Logger('Hub');

export class HubClass {
    name;
    bus = [];
    listeners = {};

    constructor(name) {
        this.name = name;
    }

    static createHub(name) {
        return new HubClass(name);
    }

    dispatch(channel, payload, source='') {
        const capsule = {
            'channel': channel,
            'payload': Object.assign({}, payload),
            'source': source
        };

        try {
            this.bus.push(capsule);
            this.toListeners(capsule);
        } catch (e) {
            logger.warn('Hub dispatch error', e);
        }
    }

    listen(channel, listener, listenerName='noname') {
        logger.debug(listenerName + ' listening ' + channel);

        let holder = this.listeners[channel];
        if (!holder) {
            holder = [];
            this.listeners[channel] = holder;
        }

        holder.push({
            'name': listenerName,
            'listener': listener
        });
    }

    toListeners(capsule) {
        const { channel, payload, source } = capsule;
        const holder = this.listeners[channel];
        if (!holder) { return; }

        holder.forEach(listener => {
            try {
                listener.listener.onHubCapsule(capsule);
            } catch (e) {
                logger.warn('error dispatching ' + channel + ' event to ' + listener.name);
            }
        });

        this.bus.pop();
    }
}

const Hub = new HubClass('__default__');
export default Hub;
