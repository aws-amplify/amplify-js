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
    constructor(name) {
        this.name = name;
        this.bus = [];
        this.listeners = {};
    }

    dispatch(channel, payload, source='') {
        logger.debug(source + ' dispatched ' + channel);

        const capsule = {
            channel: channel,
            payload: Object.assign({}, payload),
            source: source
        };

        this.bus.push(capsule);
        this.toListeners(capsule);
    }

    listen(channel, listener, listener_name='noname') {
        logger.debug(listener_name + ' listening ' + channel);

        let holder = this.listeners[channel];
        if (!holder) {
            holder = [];
            this.listeners[channel] = holder;
        }

        holder.push({
            name: listener_name,
            listener: listener
        });
    }

    toListeners(capsule) {
        const { channel, payload, source } = capsule;
        const holder = this.listeners[channel];
        if (!holder) { return; }

        holder.forEach(listener => {
            logger.debug(listener.name + ' notified of capsule ' + channel);
            listener.listener.onHubCapsule(capsule);
        });
    }
}

const Hub = new HubClass('__default__');
export default Hub;

Hub.createHub = (name) => {
    return new HubClass(name);
}
