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
import { View } from 'react-native';
import { I18n } from 'aws-amplify';
import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
import { Header } from '../AmplifyUI';
import { AmplifyThemeType } from '../AmplifyTheme';
import TEST_ID from '../AmplifyTestIDs';

export default class Loading extends AuthPiece<
	IAuthPieceProps,
	IAuthPieceState
> {
	constructor(props: IAuthPieceProps) {
		super(props);

		this._validAuthStates = ['loading'];
	}

	showComponent(theme: AmplifyThemeType) {
		return (
			<View style={theme.section}>
				<Header theme={theme} testID={TEST_ID.AUTH.LOADING_TEXT}>
					{I18n.get('Loading...')}
				</Header>
			</View>
		);
	}
}
