import { Auth } from '@aws-amplify/auth';
import { Component, h, Prop } from '@stencil/core';

import { SIGN_IN_WITH_AWS } from '../../common/constants';
import { FederatedConfig } from '../../common/types/auth-types';

@Component({
  tag: 'amplify-oauth-button',
  shadow: true,
})
export class AmplifyOAuthButton {
  @Prop() config: FederatedConfig['oauthConfig'] = {};
  /** (Optional) Override default styling */
  @Prop() overrideStyle: boolean = false;

  signInWithOAuth(event) {
    event.preventDefault();
    Auth.federatedSignIn();
  }

  render() {
    return (
      <amplify-sign-in-button
        onClick={event => this.signInWithOAuth(event)}
        overrideStyle={this.overrideStyle}
        provider="oauth"
      >
        {this.config.label || SIGN_IN_WITH_AWS}
      </amplify-sign-in-button>
    );
  }
}
