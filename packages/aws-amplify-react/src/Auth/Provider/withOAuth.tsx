/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { I18n } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';
import AmplifyTheme from '../../Amplify-UI/Amplify-UI-Theme';
import { oAuthSignInButton } from '@aws-amplify/ui';
import {
	SignInButton,
	SignInButtonContent,
} from '../../Amplify-UI/Amplify-UI-Components-React';

export function withOAuth(Comp) {
	return class extends React.Component<any, any> {
		constructor(props: any) {
			super(props);
			this.signIn = this.signIn.bind(this);
		}

		signIn(_e, provider) {
			Auth.federatedSignIn({ provider });
		}

		render() {
			return <Comp {...this.props} OAuthSignIn={this.signIn} />;
		}
	};
}

const Button = (props: any) => (
	<SignInButton
		id={oAuthSignInButton}
		onClick={() => props.OAuthSignIn()}
		theme={props.theme || AmplifyTheme}
		variant={'oAuthSignInButton'}
	>
		<SignInButtonContent theme={props.theme || AmplifyTheme}>
			{I18n.get(props.label || 'Sign in with AWS')}
		</SignInButtonContent>
	</SignInButton>
);

export const OAuthButton = withOAuth(Button);

/**
 * @deprecated use named import
 */
export default withOAuth;
