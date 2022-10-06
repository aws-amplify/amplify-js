import { Auth } from '@aws-amplify/auth';
import { I18n, ConsoleLogger as Logger } from '@aws-amplify/core';
import { Component, h, Prop } from '@stencil/core';
import { dispatchAuthStateChangeEvent } from '../../common/helpers';
import { AUTH_SOURCE_KEY, NO_AUTH_MODULE_FOUND } from '../../common/constants';
import { Translations } from '../../common/Translations';
import {
	AuthState,
	FederatedConfig,
	AuthStateHandler,
} from '../../common/types/auth-types';

const logger = new Logger('amplify-google-button');

@Component({
	tag: 'amplify-google-button',
	shadow: true,
})
export class AmplifyGoogleButton {
	/** Auth state change handler for this component
	 * e.g. SignIn -> 'Create Account' link -> SignUp
	 */
	@Prop()
	handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;
	/** App-specific client ID from Google */
	@Prop() clientId: FederatedConfig['googleClientId'];

	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}

	private getAuthInstance() {
		if (window['gapi'] && window['gapi'].auth2) {
			return (
				window['gapi'].auth2.getAuthInstance() ||
				window['gapi'].auth2.init({
					client_id: this.clientId,
					cookiepolicy: 'single_host_origin',
					scope: 'profile email openid',
				})
			);
		}

		return null;
	}

	private signInWithGoogle(event) {
		event.preventDefault();

		this.getAuthInstance()
			.signIn()
			.then(this.handleUser)
			.catch(this.handleError);
	}

	private handleError = error => {
		console.error(error);
	};

	/**
	 * @see https://developers.google.com/identity/sign-in/web/build-button#building_a_button_with_a_custom_graphic
	 */
	private handleLoad = () => {
		window['gapi'].load('auth2');
	};

	private handleUser = async user => {
		if (
			!Auth ||
			typeof Auth.federatedSignIn !== 'function' ||
			typeof Auth.currentAuthenticatedUser !== 'function'
		) {
			throw new Error(NO_AUTH_MODULE_FOUND);
		}

		try {
			window.localStorage.setItem(
				AUTH_SOURCE_KEY,
				JSON.stringify({ provider: 'google' })
			);
		} catch (e) {
			logger.debug('Failed to cache auth source into localStorage', e);
		}

		const { id_token, expires_at } = user.getAuthResponse();
		const profile = user.getBasicProfile();

		await Auth.federatedSignIn(
			'google',
			{ token: id_token, expires_at },
			{
				email: profile.getEmail(),
				name: profile.getName(),
				picture: profile.getImageUrl(),
			}
		);

		const authenticatedUser = await Auth.currentAuthenticatedUser();

		try {
			this.handleAuthStateChange(AuthState.SignedIn, authenticatedUser);
		} catch (error) {
			this.handleError(error);
		}
	};

	render() {
		return (
			<amplify-sign-in-button
				onClick={event => this.signInWithGoogle(event)}
				provider="google"
			>
				<script
					onLoad={this.handleLoad}
					src="https://apis.google.com/js/api:client.js"
				></script>
				{I18n.get(Translations.SIGN_IN_WITH_GOOGLE)}
			</amplify-sign-in-button>
		);
	}
}
