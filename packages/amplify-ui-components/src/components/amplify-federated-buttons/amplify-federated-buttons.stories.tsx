import { h } from '@stencil/core';
import { AuthState } from '../../common/types/auth-types';

const handleStateChange = (...args) => {
	console.log('handleStateChange', ...args);
};

export default {
	title: 'amplify-federated-buttons',
};

export const renderWithCorrectAuthState = () => (
	<amplify-federated-buttons
		authState={AuthState.SignIn}
		federated={{
			googleClientId: 'google_client_id',
			facebookAppId: 'facebook_app_id',
		}}
		handleAuthStateChange={handleStateChange}
	/>
);

export const renderWithCorrectAuthStateAndOnlyFacebookId = () => (
	<amplify-federated-buttons
		authState={AuthState.SignIn}
		federated={{
			facebookAppId: 'facebook_app_id',
		}}
		handleAuthStateChange={handleStateChange}
	/>
);

export const renderWithCorrectAuthStateAndOnlyGoogleId = () => (
	<amplify-federated-buttons
		authState={AuthState.SignIn}
		federated={{
			googleClientId: 'google_client_id',
		}}
		handleAuthStateChange={handleStateChange}
	/>
);

export const renderNothingWithIncorrectAuthState = () => (
	<amplify-federated-buttons
		// @ts-ignore intentionally setting invalid state
		authState="someInvalidState"
		federated={{}}
		handleAuthStateChange={handleStateChange}
	/>
);

export const renderNothingWithNoFederatedProp = () => (
	<amplify-federated-buttons
		// @ts-ignore intentionally setting invalid state
		authState="someInvalidState"
		federated={undefined}
		handleAuthStateChange={handleStateChange}
	/>
);
