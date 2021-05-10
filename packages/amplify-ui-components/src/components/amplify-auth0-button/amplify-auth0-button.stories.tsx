import { h } from '@stencil/core';
import * as knobs from '@storybook/addon-knobs';

export default {
	title: 'amplify-auth0-button',
};

export const defaults = () => (
	<amplify-auth0-button
		config={{
			clientID: knobs.text('Auth0 client ID', 'auth0_client_id'),
			domain: knobs.text('Auth0 account domain', 'example.auth0.com'),
			redirectUri: knobs.text('App URL', 'http://localhost:3000/'),
			responseType: 'token id_token',
			scope: knobs.text('Scope', 'openid profile email'),
		}}
	/>
);
