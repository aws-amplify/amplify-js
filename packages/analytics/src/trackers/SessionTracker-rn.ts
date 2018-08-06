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

 // the session tracker for react native

import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { SessionTrackOpts } from '../types';
import { AppState } from 'react-native'; 

const logger = new Logger('SessionTracker');

const defaultOpts: SessionTrackOpts = {
    enable: false
};

export default class SessionTracker {
    private _tracker;
    private _hasEnabled;
    private _config: SessionTrackOpts;

    constructor(tracker, opts) {
        this._config = Object.assign({}, defaultOpts, opts);
        this._tracker = tracker;
        
        this._hasEnabled = false;
        this._trackFunc = this._trackFunc.bind(this);
        this.configure(this._config);
    }

    private _envCheck() {
        if (!AppState) {
            logger.debug('not in the supported react native environment');
            return false;
        }
        return true;
    }

    private _trackFunc(nextAppState) {
        const currentState = AppState.currentState;

        if (currentState.match(/inactive|background/) && nextAppState === 'active') {
            logger.debug('App has come to the foreground, recording start session');
            this._tracker({
                name: '_session_start'
            }).catch(e => {
                logger.debug('record session start event failed.', e);
            });
        }
        if (currentState.match(/active/) && nextAppState.match(/inactive|background/)) {
            logger.debug('App has come to inactive/background, recording stop session');
             this._tracker({
                name: '_session_stop'
            }).catch(e => {
                logger.debug('record session stop event failed.', e);
            });
        }
    }

    configure(opts: SessionTrackOpts) {
        if (!this._envCheck()) {
            return;
        }

        Object.assign(this._config, opts);

        if (this._config.enable && !this._hasEnabled) {
            // send a start session as soon as it's enabled
            this._tracker({
                name: '_session_start'
            }).catch(e => {
                logger.debug('record session start event failed.', e);
            });
            // listen on events
            AppState.addEventListener('change', this._trackFunc, false);
            this._hasEnabled = true;
        } else {
            document.removeEventListener('change', this._trackFunc, false);
            this._hasEnabled = false;
        }
    }
}
