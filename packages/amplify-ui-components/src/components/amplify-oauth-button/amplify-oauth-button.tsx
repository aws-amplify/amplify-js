import { Auth } from '@aws-amplify/auth';
import { I18n } from '@aws-amplify/core';
import { Component, h, Listen, Prop } from '@stencil/core';

import { SIGN_IN_WITH_AWS } from '../../common/constants';

@Component({
  tag: 'amplify-oauth-button',
  shadow: false,
})
export class AmplifyOAuthButton {
  @Prop() oauth_config: any = {};

  @Listen('click')
  handleClick(event) {
    event.preventDefault();
    Auth.federatedSignIn();
  }

  render() {
    return (
      <amplify-sign-in-button provider="oauth">
        {I18n.get(this.oauth_config.label || SIGN_IN_WITH_AWS)}
      </amplify-sign-in-button>
    );
  }
}
