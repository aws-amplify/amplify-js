import { I18n } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { Component, h, Prop } from '@stencil/core';
import { dispatchAuthStateChangeEvent } from '../../common/helpers';
import { AUTH_SOURCE_KEY, NO_AUTH_MODULE_FOUND } from '../../common/constants';
import {
	AuthState,
	FederatedConfig,
	AuthStateHandler,
} from '../../common/types/auth-types';
import { Translations } from '../../common/Translations';

const logger = new Logger('amplify-amazon-button');

@Component({
	tag: 'amplify-amazon-button',
	shadow: true,
})
export class AmplifyAmazonButton {
	/** App-specific client ID from Google */
	@Prop() clientId: FederatedConfig['amazonClientId'];
	/** Auth state change handler for this component
	 * e.g. SignIn -> 'Create Account' link -> SignUp
	 */
	@Prop()
	handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;

	private federatedSignIn = response => {
		const { access_token, expires_in } = response;

		if (!access_token) {
			return;
		}

		if (
			!Auth ||
			typeof Auth.federatedSignIn !== 'function' ||
			typeof Auth.currentAuthenticatedUser !== 'function'
		) {
			throw new Error(NO_AUTH_MODULE_FOUND);
		}

		const date = new Date();
		const expires_at = expires_in * 1000 + date.getTime();

		window['amazon'].Login.retrieveProfile(async userInfo => {
			if (!userInfo.success) {
				return logger.debug('Get user Info failed');
			}

			const user = {
				name: userInfo.profile.Name,
				email: userInfo.profile.PrimaryEmail,
			};

			await Auth.federatedSignIn(
				'amazon',
				{ token: access_token, expires_at },
				user
			);

			const authenticatedUser = await Auth.currentAuthenticatedUser();

			this.handleAuthStateChange(AuthState.SignedIn, authenticatedUser);
		});
	};

	/**
	 * @see https://developer.amazon.com/docs/login-with-amazon/install-sdk-javascript.html
	 */
	private signInWithAmazon(event) {
		event.preventDefault();

		window['amazon'].Login.setClientId(this.clientId);

		window['amazon'].Login.authorize({ scope: 'profile' }, response => {
			if (response.error) {
				return logger.debug('Failed to login with amazon: ' + response.error);
			}

			try {
				window.localStorage.setItem(
					AUTH_SOURCE_KEY,
					JSON.stringify({ provider: 'amazon' })
				);
			} catch (e) {
				logger.debug('Failed to cache auth source into localStorage', e);
			}

			this.federatedSignIn(response);
		});
	}

	render() {
		return (
			<amplify-sign-in-button
				onClick={event => this.signInWithAmazon(event)}
				provider="amazon"
			>
				<script src="https://assets.loginwithamazon.com/sdk/na/login1.js"></script>
				{I18n.get(Translations.SIGN_IN_WITH_AMAZON)}
			</amplify-sign-in-button>
		);
	}
}
