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

import { withGoogle } from './withGoogle';
import { withFacebook } from './withFacebook';
import { withAmazon } from './withAmazon';
import { withOAuth } from './withOAuth';
import { withAuth0 } from './withAuth0';

export { withGoogle, GoogleButton } from './withGoogle';
export { withFacebook, FacebookButton } from './withFacebook';
export { withAmazon, AmazonButton } from './withAmazon';
export { withOAuth, OAuthButton } from './withOAuth';
export { withAuth0, Auth0Button } from './withAuth0';

export function withFederated(Comp) {
	const Federated = withAuth0(
		withOAuth(withAmazon(withGoogle(withFacebook(Comp))))
	);

	return class extends React.Component {
		render() {
			// @ts-ignore
			const federated = this.props.federated || {};
			return <Federated {...this.props} {...federated} />;
		}
	};
}
