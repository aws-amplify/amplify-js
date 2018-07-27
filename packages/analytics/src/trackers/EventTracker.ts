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

import { delegate } from 'dom-utils';
import { EventTrackOpts } from '../types';
import { ConsoleLogger as Logger } from '@aws-amplify/core';

const logger = new Logger('EventTracker');

const defaultOpts: EventTrackOpts = {
    enable: false,
    events: ['click'],
    selectorPrefix: 'amplify-analytics-'
}

export default class EventTracker {
    private _tracker;
    private _config: EventTrackOpts;
    private _delegates;

    constructor(tracker, opts) {
        if (!window || !window.addEventListener) {
            logger.debug('not in the supported web enviroment');
            return;
        }

        this._config = Object.assign({}, defaultOpts, opts);
        this._tracker = tracker;
        this._trackFunc = this._trackFunc.bind(this);

        logger.debug('initialize pageview tracker with opts', this._config);
    
        const selector = '[' + this._config.selectorPrefix + 'on]';
        this._delegates = {};
        this._config.events.forEach((evt) => {
            this._delegates[evt] = delegate(
                document,
                evt,
                selector,
                this._trackFunc,
                {composed: true, useCapture: true}
            );
        });
    }    

    private _trackFunc(event, element) {
        // the events specifed in 'aws-aplify-analytics-on' selector
        const events = element
            .getAttribute(this._config.selectorPrefix + 'on')
            .split(/\s*,\s*/);
        const attributes = element
            .getAttribute(this._config.selectorPrefix + 'attrs')
            .split(/\s*,\s*/);

        const customAttrs = {};
        attributes.forEach(attribute => {
            const tmp = attribute.split(/\s*:\s/);
            customAttrs[tmp[0]] = tmp[1];
        });
        

        logger.debug('events needed to be recorded', events);
        logger.debug('attributes needed to be attached', customAttrs);
        if (events.indexOf(event.type) < 0) {
            logger.debug(`event ${event.type} is not selected to be recorded`);
            return;
        }



        // this._tracker({
        //     name: 'event',
        //     attributes: {
        //         eventType: event.type,


        //     }
        // })
    }

}