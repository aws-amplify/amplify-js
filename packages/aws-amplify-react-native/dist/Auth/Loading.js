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
import { View, Text } from 'react-native';
import { I18n } from 'aws-amplify';
import AuthPiece from './AuthPiece';
import { Header } from '../AmplifyUI';

export default class Loading extends AuthPiece {
  constructor(props) {
    super(props);

    this._validAuthStates = ['loading'];
  }

  showComponent(theme) {
    return React.createElement(
      View,
      { style: theme.section },
      React.createElement(
        Header,
        { theme: theme },
        I18n.get('Loading...')
      )
    );
  }
}