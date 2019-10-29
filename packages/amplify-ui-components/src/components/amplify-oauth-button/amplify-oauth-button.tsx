import { I18n } from '@aws-amplify/core';
import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

@Component({ tag: 'amplify-oauth-button' })
export class AmplifyOAuthButton {
  /** App-specific client ID from Google */
  @Prop() oauth_config: any = {};
  /** Listener when `authState` changes */
  @Event() stateChange: EventEmitter;

  render() {
    return <amplify-sign-in-button provider="oauth">{I18n.get('Sign in with AWS')}</amplify-sign-in-button>;
  }
}
