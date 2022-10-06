import { Auth } from '@aws-amplify/auth';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { Component, h, Prop } from '@stencil/core';

import { NO_AUTH_MODULE_FOUND } from '../../common/constants';
import { AuthState } from '../../common/types/auth-types';

const logger = new Logger('amplify-federated-sign-in');

@Component({
	tag: 'amplify-federated-sign-in',
	shadow: true,
})
export class AmplifyFederatedSignIn {
	/** The current authentication state. */
	@Prop() authState: AuthState = AuthState.SignIn;
	/** Federated credentials & configuration. */
	@Prop() federated: any = {};

	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);

		if (!Auth || typeof Auth.configure !== 'function') {
			throw new Error(NO_AUTH_MODULE_FOUND);
		}

		const { oauth = {} } = Auth.configure();

		// backward compatibility
		if (oauth['domain']) {
			this.federated.oauth_config = {
				...this.federated.oauth_config,
				...oauth,
			};
		} else if (oauth['awsCognito']) {
			this.federated.oauth_config = {
				...this.federated.oauth_config,
				...oauth['awsCognito'],
			};
		}

		if (oauth['auth0']) {
			this.federated.auth0 = { ...this.federated.auth0, ...oauth['auth0'] };
		}
	}

	render() {
		if (!this.federated) {
			logger.debug('federated prop is empty. show nothing');
			logger.debug(
				'federated={google_client_id: , facebook_app_id: , amazon_client_id}'
			);

			return null;
		}

		if (!Object.values(AuthState).includes(this.authState)) {
			return null;
		}

		logger.debug('federated Config is', this.federated);

		return (
			<amplify-form-section data-test="federated-sign-in-section">
				<amplify-section data-test="federated-sign-in-body-section">
					<amplify-federated-buttons
						authState={this.authState}
						data-test="federated-sign-in-buttons"
						federated={this.federated}
					/>
				</amplify-section>
			</amplify-form-section>
		);
	}
}
