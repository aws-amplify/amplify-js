import { Auth } from '@aws-amplify/auth';
import { isEmpty } from '@aws-amplify/core';
import { Component, h, Prop } from '@stencil/core';
import { dispatchAuthStateChangeEvent } from '../../common/helpers';
import { NO_AUTH_MODULE_FOUND } from '../../common/constants';
import {
	AuthState,
	FederatedConfig,
	AuthStateHandler,
} from '../../common/types/auth-types';

@Component({
	tag: 'amplify-federated-buttons',
	shadow: true,
})
export class AmplifyFederatedButtons {
	/** The current authentication state. */
	@Prop() authState: AuthState = AuthState.SignIn;
	/** Federated credentials & configuration. */
	@Prop() federated: FederatedConfig = {};
	/** Auth state change handler for this component
	 * e.g. SignIn -> 'Create Account' link -> SignUp
	 */
	@Prop()
	handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;

	componentWillLoad() {
		if (!Auth || typeof Auth.configure !== 'function') {
			throw new Error(NO_AUTH_MODULE_FOUND);
		}

		const { oauth = {} } = Auth.configure();

		// backward compatibility
		if (oauth['domain']) {
			this.federated.oauthConfig = { ...this.federated.oauthConfig, ...oauth };
		} else if (oauth['awsCognito']) {
			this.federated.oauthConfig = {
				...this.federated.oauthConfig,
				...oauth['awsCognito'],
			};
		}

		if (oauth['auth0']) {
			this.federated.auth0Config = {
				...this.federated.auth0Config,
				...oauth['auth0'],
			};
		}
	}

	render() {
		if (!Object.values(AuthState).includes(this.authState)) {
			return null;
		}

		if (isEmpty(this.federated)) {
			return null;
		}

		const {
			amazonClientId,
			auth0Config,
			facebookAppId,
			googleClientId,
			oauthConfig,
		} = this.federated;

		return (
			<div>
				{googleClientId && (
					<div>
						<amplify-google-button
							clientId={googleClientId}
							handleAuthStateChange={this.handleAuthStateChange}
						/>
					</div>
				)}

				{facebookAppId && (
					<div>
						<amplify-facebook-button
							appId={facebookAppId}
							handleAuthStateChange={this.handleAuthStateChange}
						/>
					</div>
				)}

				{amazonClientId && (
					<div>
						<amplify-amazon-button
							clientId={amazonClientId}
							handleAuthStateChange={this.handleAuthStateChange}
						/>
					</div>
				)}

				{oauthConfig && (
					<div>
						<amplify-oauth-button config={oauthConfig} />
					</div>
				)}

				{auth0Config && (
					<div>
						<amplify-auth0-button
							config={auth0Config}
							handleAuthStateChange={this.handleAuthStateChange}
						/>
					</div>
				)}
			</div>
		);
	}
}
