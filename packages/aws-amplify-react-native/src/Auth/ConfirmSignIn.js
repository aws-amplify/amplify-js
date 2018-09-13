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
    View, 
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import {
    Auth,
    I18n,
    Logger
} from 'aws-amplify';
import {
    AmplifyButton,
    FormField, 
    LinkCell, 
    Header, 
    ErrorRow 
} from '../AmplifyUI';
import AuthPiece from './AuthPiece';

const logger = new Logger('SignIn');

export default class ConfirmSignIn extends AuthPiece {
    constructor(props) {
        super(props);

        this._validAuthStates = ['confirmSignIn'];
        this.state = {
            code: null,
            error: null
        }

        this.confirm = this.confirm.bind(this);
    }

    confirm() {
        const user = this.props.authData;
        const { code } = this.state;
        logger.debug('Confirm Sign In for ' + user.username);
        Auth.confirmSignIn(user, code)
            .then(data => this.changeState('signedIn'))
            .catch(err => this.error(err));
    }

    showComponent(theme) {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={theme.section}>
                    <Header theme={theme}>{I18n.get('Confirm Sign In')}</Header>
                    <View style={theme.sectionBody}>
                        <FormField
                            theme={theme}
                            onChangeText={(text) => this.setState({ code: text })}
                            label={I18n.get('Confirmation Code')}
                            placeholder={I18n.get('Enter your confirmation code')}
                            required={true}
                        />
                        <AmplifyButton
                            text={I18n.get('Confirm')}
                            onPress={this.confirm}
                            disabled={!this.state.code}
                        />
                    </View>
                    <View style={theme.sectionFooter}>
                        <LinkCell theme={theme} onPress={() => this.changeState('signIn')}>
                            {I18n.get('Back to Sign In')}
                        </LinkCell>
                    </View>
                    <ErrorRow theme={theme}>{this.state.error}</ErrorRow>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
