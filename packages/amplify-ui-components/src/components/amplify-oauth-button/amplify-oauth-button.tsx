import { Auth } from '@aws-amplify/auth';
import { I18n } from '@aws-amplify/core';
import { Component, h, Prop } from '@stencil/core';

import { FederatedConfig } from '../../common/types/auth-types';
import { Translations } from '../../common/Translations';

@Component({
	tag: 'amplify-oauth-button',
	shadow: true,
})
export class AmplifyOAuthButton {
	/** Federated credentials & configuration. */
	@Prop() config: FederatedConfig['oauthConfig'] = {};

	private signInWithOAuth(event) {
		event.preventDefault();
		Auth.federatedSignIn();
	}

	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}

	render() {
		return (
			<amplify-sign-in-button
				onClick={event => this.signInWithOAuth(event)}
				provider="oauth"
			>
				{this.config.label || I18n.get(Translations.SIGN_IN_WITH_AWS)}
			</amplify-sign-in-button>
		);
	}
}
