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
import { Auth, I18n, Logger } from 'aws-amplify';

import AmplifyTheme from '../AmplifyTheme';
import {
    FormSection,
    SectionHeader,
    SectionBody,
    SectionFooter,
    InputRow,
    RadioRow,
    MessageRow,
    ButtonRow,
    Link,
    NavButton
} from '../AmplifyUI';

const logger = new Logger('UserProfile');

export default class UserProfile extends Component{
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div>
                <NavButton
                    theme={AmplifyTheme}
                    onClick={this.signOut}
                >{I18n.get('Sign Out')}
                </NavButton>
            </div>
        )
    }
}
