import { I18n } from '@aws-amplify/core';
import { Component, h, Prop } from '@stencil/core';

@Component({ tag: 'amplify-oauth-button' })
export class AmplifyOAuthButton {
  /** App-specific client ID from Google */
  @Prop() oauth_config: any = {};

  render() {
    return <amplify-sign-in-button provider="oauth">{I18n.get('Sign in with AWS')}</amplify-sign-in-button>;
  }
}
