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

interface IPattern {
    pattern: RegExp,
    callback: Function
}

interface IListener {
    name: string,
    callback: HubCallback
}

export type HubCapsule = {
    channel: string,
    payload: HubPayload,
    source: string
}

export type HubPayload = {
    event: string,
    data?: any
}

export type HubCallback = (capsule: HubCapsule) => void;

export type LegacyCallback = { onHubCapsule: HubCallback };

function isLegacyCallback(callback: any): callback is LegacyCallback {
    return (<LegacyCallback>callback).onHubCapsule !== undefined;
}

export class HubClass {
    name: string;
    listeners: IListener[] = [];
    patterns: IPattern[] = [];

    protectedChannels = ['core', 'auth', 'api', 'analytics', 'interactions', 'pubsub', 'storage', 'xr'];

    constructor(name: string) {
        this.name = name;
    }

    // Note - Need to pass channel as a reference for removal to work and not anonymous function
    remove(channel: string | RegExp, listener: HubCallback) {
        if (channel instanceof RegExp) {
            let pattern = this.patterns.find(({ pattern }) => pattern.source === channel.source);
            if (!pattern) {
                logger.warn(`No listeners for ${channel}`);
                return;
            }
            this.patterns = [...this.patterns.filter(x => x !== pattern)];
        } else {
            let holder = this.listeners[channel];
            if (!holder) {
                logger.warn(`No listeners for ${channel}`);
                return;
            }
            this.listeners[channel] = [...holder.filter(({ callback }) => callback !== listener)];
        }
    }

    dispatch(channel: string, payload: HubPayload, source: string = '', ampSymbol?: Symbol) {

        if (this.protectedChannels.indexOf(channel) > -1) {
            const hasAccess = ampSymbol === Symbol.for('amplify_default');

            if (!hasAccess) {
                logger.warn(`WARNING: ${channel} is protected and dispatching on it can have unintended consequences`);
            }
        }

        const capsule: HubCapsule = {
            channel: channel,
            payload: { ...payload },
            source: source
        };

        try {
            this._toListeners(capsule);
        } catch (e) { logger.error(e) }
    }

    listen(channel: string | RegExp, callback?: HubCallback | LegacyCallback, listenerName = 'noname') {
        //Check for legacy onHubCapsule callback for backwards compatability
        if (isLegacyCallback(callback)) {
            logger.warn(`WARNING onHubCapsule is Deprecated and will be removed in the future. Please pass in a callback.`);
            callback = callback.onHubCapsule
        } else if (typeof callback !== 'function') {
            throw new Error('No callback supplied to Hub');
        }

        if (channel instanceof RegExp) {
            if (callback != undefined) {
                this.patterns.push({
                    pattern: channel,
                    callback: callback
                });
            } else { logger.error(`Cannot listen for ${channel} without a callback defined`) }
        } else {
            let holder = this.listeners[channel];

            if (!holder) {
                holder = [];
                this.listeners[channel] = holder;
            }

            holder.push({
                name: listenerName,
                callback: callback
            })
        }
    }

    private _toListeners(capsule: HubCapsule) {
        const { channel, payload } = capsule;
        const holder = this.listeners[channel];

        if (holder) {
            holder.forEach(listener => {
                logger.debug(`Dispatching to ${listener}: `, payload);
                try {
                    listener.callback(capsule);
                } catch (e) { logger.error(e); }
            })
        }

        if (this.patterns.length > 0) {

            if (!payload.data) {
                logger.warn(`Cannot perform pattern matching without a data key in your payload`);
                return;
            }

            this.patterns.forEach(pattern => {
                if (pattern.pattern.test(payload.data.toString())) {
                    try {
                        pattern.callback(capsule)
                    } catch (e) { logger.error(e); }
                }
            })
        }
    }
};

/*We export a __default__ instance of HubClass to use it as a 
psuedo Singleton for the main messaging bus, however you can still create
your own instance of HubClass() for a separate "private bus" of events.*/
const Hub = new HubClass('__default__');
export default Hub;
