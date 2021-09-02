import { h } from '@stencil/core';
import * as knobs from '@storybook/addon-knobs';

export default {
	title: 'amplify-authenticator',
};

export const defaults = () => <amplify-authenticator />;

export const withFederated = () => (
	<amplify-authenticator
		federated={{
			amazonClientId: knobs.text('Amazon client ID', 'amazon_client_id'),
			auth0Config: {
				clientID: knobs.text('Auth0 client ID', 'auth0_client_id'),
				domain: knobs.text('Auth0 account domain', 'example.auth0.com'),
				redirectUri: 'http://localhost:3000/',
				responseType: 'token id_token',
			},
			facebookAppId: knobs.text('Facebook app ID', 'facebook_app_id'),
			googleClientId: knobs.text('Google client ID', 'google_client_id'),
			oauthConfig: {},
		}}
	/>
);
