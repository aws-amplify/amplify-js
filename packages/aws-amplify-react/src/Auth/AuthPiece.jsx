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

import * as React from 'react';
import { ConsoleLogger as Logger, I18n } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';
import countryDialCodes from './common/country-dial-codes.js';
import { 
    FormField,
    Input,
    InputLabel,
    SelectInput
 } from '../Amplify-UI/Amplify-UI-Components-React';
import { UsernameAttributes } from './common/types';

export default class AuthPiece extends React.Component {
    constructor(props) {
        super(props);

        this.inputs = {};

        this._isHidden = true;
        this._validAuthStates = [];
        this.changeState = this.changeState.bind(this);
        this.error = this.error.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.renderUsernameField = this.renderUsernameField.bind(this);
        this.getUsernameFromInput = this.getUsernameFromInput.bind(this);
    }

    getUsernameFromInput() {
        const { usernameAttributes = [] } = this.props;
        if (usernameAttributes === UsernameAttributes.EMAIL) {
            // Email as Username
            return this.inputs.email;
        } else if (usernameAttributes === UsernameAttributes.PHONE_NUMBER) {
            // Phone number as Username
            if (!this.inputs.phone_line_number 
                || this.inputs.phone_line_number.length === 0) return '';
            else return `${this.inputs.dial_code || '+1'}${this.inputs.phone_line_number.replace(/[-()]/g, '')}`;
        } else {
            return this.inputs.username;
        }
    }

    renderUsernameField(theme) {
        const { usernameAttributes = [] } = this.props;
        if (usernameAttributes === UsernameAttributes.EMAIL) {
            return (
                <FormField theme={theme}>           
                    <InputLabel theme={theme}>{I18n.get('Email')} *</InputLabel>
                    <Input
                        autoFocus
                        placeholder={I18n.get('Enter your email')}
                        theme={theme}
                        key="email"
                        name="email"
                        onChange={this.handleInputChange}
                        data-test="email-input"
                    />
                </FormField>
            );
        } else if (usernameAttributes === UsernameAttributes.PHONE_NUMBER) {
            return (
                <FormField theme={theme} key="phone_number">
                    <InputLabel theme={theme}>{I18n.get('Phone number')} *</InputLabel>
                    <SelectInput theme={theme}>
                        <select name="dial_code" defaultValue={"+1"} 
                        onChange={this.handleInputChange}
                        data-test="dial-code-select">
                            {countryDialCodes.map(dialCode =>
                                <option key={dialCode} value={dialCode}>
                                    {dialCode}
                                </option>
                            )}
                        </select>
                        <Input
                            placeholder={I18n.get("Enter your phone number")}
                            theme={theme}
                            type="tel"
                            id="phone_line_number"
                            key="phone_line_number"
                            name="phone_line_number"
                            onChange={this.handleInputChange}
                            data-test="phone-number-input"
                        />
                    </SelectInput>
                </FormField>
            );
        } else {
            return (
                <FormField theme={theme}>           
                    <InputLabel theme={theme}>{I18n.get('Username')} *</InputLabel>
                    <Input
                        autoFocus
                        placeholder={I18n.get('Enter your username')}
                        theme={theme}
                        key="username"
                        name="username"
                        onChange={this.handleInputChange}
                        data-test="username-input"
                    />
                </FormField>
            );
        }
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
            this.inputs = {};
            return null;
        }

        if (this._isHidden) {
            this.inputs = {};
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
