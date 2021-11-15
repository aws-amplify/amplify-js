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
import { isEmpty, ConsoleLogger as Logger } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';
import { AuthPiece, IAuthPieceProps, IAuthPieceState } from './AuthPiece';
import { TOTPSetupComp } from '../Widget/TOTPSetupComp';

import { auth } from '../Amplify-UI/data-test-attributes';

const logger = new Logger('TOTPSetup');

export class TOTPSetup extends AuthPiece<IAuthPieceProps, IAuthPieceState> {
	constructor(props: IAuthPieceProps) {
		super(props);

		this._validAuthStates = ['TOTPSetup'];
		this.onTOTPEvent = this.onTOTPEvent.bind(this);
		this.checkContact = this.checkContact.bind(this);
	}

	checkContact(user) {
		if (!Auth || typeof Auth.verifiedContact !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.verifiedContact(user).then((data) => {
			if (!isEmpty(data.verified)) {
				this.changeState('signedIn', user);
			} else {
				const newUser = Object.assign(user, data);
				this.changeState('verifyContact', newUser);
			}
		});
	}

	onTOTPEvent(event, data, user) {
		logger.debug('on totp event', event, data);
		// const user = this.props.authData;
		if (event === 'Setup TOTP') {
			if (data === 'SUCCESS') {
				this.checkContact(user);
			}
		}
	}

	showComponent(theme) {
		const { hide } = this.props;
		if (hide && hide.includes(TOTPSetup)) {
			return null;
		}

		return (
			<TOTPSetupComp
				{...this.props}
				onTOTPEvent={this.onTOTPEvent}
				data-test={auth.TOTPSetup.component}
			/>
		);
	}
}

/**
 * @deprecated use named import
 */
export default TOTPSetup;
