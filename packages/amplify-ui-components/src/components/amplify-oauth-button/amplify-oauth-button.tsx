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

	render() {
		return (
			<amplify-sign-in-button
				onClick={(event) => this.signInWithOAuth(event)}
				provider="oauth"
			>
				{this.config.label || I18n.get(Translations.SIGN_IN_WITH_AWS)}
			</amplify-sign-in-button>
		);
	}
}
