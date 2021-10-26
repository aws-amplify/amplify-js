import { Auth } from '@aws-amplify/auth';
import { I18n, ConsoleLogger as Logger } from '@aws-amplify/core';
import { Component, h, Prop } from '@stencil/core';
import { AUTH_SOURCE_KEY } from '../../common/constants';
import {
	AuthStateHandler,
	FederatedConfig,
	AuthState,
} from '../../common/types/auth-types';
import { dispatchAuthStateChangeEvent } from '../../common/helpers';
import { Translations } from '../../common/Translations';

const logger = new Logger('amplify-auth0-button');

@Component({
	tag: 'amplify-auth0-button',
	shadow: true,
})
export class AmplifyAuth0Button {
	/** See: https://auth0.com/docs/libraries/auth0js/v9#available-parameters */
	@Prop() config: FederatedConfig['auth0Config'];
	/** Auth state change handler for this component */
	@Prop()
	handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;

	private _auth0: any;

	private handleLoad = () => {
		// @ts-ignore Property 'auth0' does not exist on type '{}'.
		const { oauth = {} } = Auth.configure();
		// @ts-ignore Property 'auth0' does not exist on type '{}'.
		const { config = oauth.auth0 } = this;

		if (!config) {
			logger.debug('Auth0 is not configured');
			return;
		}

		logger.debug('auth0 configuration', config);

		if (!this._auth0) {
			this._auth0 = new window['auth0'].WebAuth(config);
		}

		this._auth0.parseHash((err, authResult) => {
			if (err) {
				logger.debug('Failed to parse the url for Auth0', err);
				return;
			}

			if (!authResult) {
				logger.debug('Auth0 found no authResult in hash');
				return;
			}

			const payload = {
				provider: 'auth0',
				opts: {
					returnTo: config.returnTo,
					clientID: config.clientID,
					federated: config.federated,
				},
			};

			try {
				localStorage.setItem(AUTH_SOURCE_KEY, JSON.stringify(payload));
			} catch (e) {
				logger.debug('Failed to cache auth source into localStorage', e);
			}

			this._auth0.client.userInfo(authResult.accessToken, async (err, user) => {
				let username = undefined;
				let email = undefined;
				if (err) {
					logger.debug('Failed to get the user info', err);
				} else {
					username = user.name;
					email = user.email;
				}

				await Auth.federatedSignIn(
					config.domain,
					{
						token: authResult.idToken,
						expires_at: authResult.expiresIn * 1000 + new Date().getTime(),
					},
					{ name: username, email }
				);

				const authenticatedUser = await Auth.currentAuthenticatedUser();

				this.handleAuthStateChange(AuthState.SignedIn, authenticatedUser);
			});
		});
	};

	private signInWithAuth0(event) {
		event.preventDefault();

		if (!this._auth0) {
			throw new Error('the auth0 client is not configured');
		}

		this._auth0.authorize();
	}

	render() {
		return (
			<amplify-sign-in-button
				onClick={event => this.signInWithAuth0(event)}
				provider="auth0"
			>
				<script
					onLoad={this.handleLoad}
					src="https://cdn.auth0.com/js/auth0/9.11/auth0.min.js"
				></script>
				{I18n.get(Translations.SIGN_IN_WITH_AUTH0)}
			</amplify-sign-in-button>
		);
	}
}
