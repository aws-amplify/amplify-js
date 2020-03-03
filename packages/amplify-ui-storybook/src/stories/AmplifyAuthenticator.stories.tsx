import { AmplifyAuthenticator } from '@aws-amplify/ui-react';
import { withKnobs, select, text } from '@storybook/addon-knobs';
import React from 'react';

import page from './AmplifyAuthenticator.mdx';

export default {
	title: 'AmplifyAuthenticator',
	component: 'amplify-authenticator',
	decorators: [withKnobs],
	parameters: { docs: { page } },
};

export const basic = () => <AmplifyAuthenticator />;

export const federatedIdentityProviders = () => (
	<AmplifyAuthenticator
		federated={{
			amazonClientId: text('Amazon client ID', 'amazon_client_id'),
			auth0Config: {
				clientID: text('Auth0 client ID', 'auth0_client_id'),
				domain: text('Auth0 account domain', 'example.auth0.com'),
				redirectUri: 'http://localhost:3000/',
				responseType: 'token id_token',
			},
			facebookAppId: text('Facebook app ID', 'facebook_app_id'),
			googleClientId: text('Google client ID', 'google_client_id'),
			oauthConfig: {},
		}}
	/>
);

export const initialState = () => {
	const initialAuthState = select(
		'Initial Auth State',
		['signin', 'signup'],
		'signup'
	);

	return (
		<AmplifyAuthenticator
			// Dispose when initialAuthState changes
			key={initialAuthState}
			// AuthState isn't exported
			initialAuthState={initialAuthState as any}
		/>
	);
};
