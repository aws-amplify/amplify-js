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

import React, { Component } from 'react';
import { ConsoleLogger as Logger } from '@aws-amplify/core';

import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';

export default class AuthPiece extends Component {
    constructor(props) {
        super(props);

        this.inputs = {};

        this._isHidden = true;
        this._validAuthStates = [];
        this.changeState = this.changeState.bind(this);
        this.error = this.error.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    // extract username from authData
    usernameFromAuthData() {
        const { authData } = this.props;
        if (!authData) { return ''; }

        let username = '';
        if (typeof authData === 'object') { // user object
            username = authData.user? authData.user.username : authData.username;
        } else {
            username = authData; // username string
        }

        return username;
    }

    errorMessage(err) {
        if (typeof err === 'string') { return err; }
        return err.message? err.message : JSON.stringify(err);
    }

    triggerAuthEvent(event) {
        const state = this.props.authState;
        if (this.props.onAuthEvent) { this.props.onAuthEvent(state, event); }
    }

    changeState(state, data) {
        if (this.props.onStateChange) { this.props.onStateChange(state, data); }

        this.triggerAuthEvent({
            type: 'stateChange',
            data: state
        });
    }

    error(err) {
        this.triggerAuthEvent({
            type: 'error',
            data: this.errorMessage(err)
        });
    }

    handleInputChange(evt) {
        this.inputs = this.inputs || {};
        const { name, value, type, checked } = evt.target;
        const check_type = ['radio', 'checkbox'].includes(type);
        this.inputs[name] = check_type? checked : value;
        this.inputs['checkedValue'] = check_type? value: null;
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
