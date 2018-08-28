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

import React from 'react';

import {
    Logger 
} from 'aws-amplify';

import AmplifyTheme from '../AmplifyTheme';
import AmplifyMessageMap from '../AmplifyMessageMap';

const logger = new Logger('AuthPiece');

export default class AuthPiece extends React.Component {
    constructor(props) {
        super(props);

        this._isHidden = true;
        this._validAuthStates = [];
        this.changeState = this.changeState.bind(this);
        this.error = this.error.bind(this);
    }

    changeState(state, data) {
        if (this.props.onStateChange) {
            this.props.onStateChange(state, data);
        }
    }

    error(err) {
        logger.debug(err);

        let msg = '';
        if (typeof err === 'string') {
            msg = err;
        } else if (err.message) {
            msg = err.message;
        } else {
            msg = JSON.stringify(err);
        }

        const map = this.props.errorMessage || AmplifyMessageMap;
        msg = (typeof map === 'string')? map : map(msg);
        this.setState({ error: msg });
    }

    render() {
        if (!this._validAuthStates.includes(this.props.authState)) {
            this._isHidden = true;
            return null;
        }

        if (this._isHidden) {
            const { track } = this.props;
            if (track) track();
        }
        this._isHidden = false;

        return this.showComponent(this.props.theme || AmplifyTheme);
    }

    showComponent(theme) {
        throw 'You must implement showComponent(theme) and don\'t forget to set this._validAuthStates.';
    }
}
