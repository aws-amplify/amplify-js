import { Auth } from '@aws-amplify/auth';
import { I18n } from '@aws-amplify/core';
import { Component, h, Prop } from '@stencil/core';

import { FederatedConfig } from '../../common/types/auth-types';
import { AuthMessages } from '../../common/types/AuthMessages';

@Component({
  tag: 'amplify-oauth-button',
  shadow: true,
})
export class AmplifyOAuthButton {
  @Prop() config: FederatedConfig['oauthConfig'] = {};

  signInWithOAuth(event) {
    event.preventDefault();
    Auth.federatedSignIn();
  }

  render() {
    return (
      <amplify-sign-in-button onClick={event => this.signInWithOAuth(event)} provider="oauth">
        {this.config.label || I18n.get(AuthMessages.SIGN_IN_WITH_AWS)}
      </amplify-sign-in-button>
    );
  }
}
