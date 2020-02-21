import { Component, Prop, h } from '@stencil/core';
import { SIGN_OUT, NO_AUTH_MODULE_FOUND } from '../../common/constants';
import { AuthState, AuthStateHandler } from '../../common/types/auth-types';
import { Auth } from '@aws-amplify/auth';
import { dispatchToastHubEvent, dispatchAuthStateChangeEvent } from '../../common/helpers';

@Component({
  tag: 'amplify-sign-out',
  shadow: true,
})
export class AmplifySignOut {
  /** Passed from the Authenticator component in order to change Authentication state */
  @Prop() handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;
  /** Text inside of the Sign Out button */
  @Prop() buttonText: string = SIGN_OUT;

  async signOut(event) {
    if (event) event.preventDefault();

    // TODO: Federated Sign Out

    if (!Auth || typeof Auth.signOut !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }

    try {
      await Auth.signOut();
      this.handleAuthStateChange(AuthState.SignedOut);
    } catch (error) {
      dispatchToastHubEvent(error);
    }
  }

  render() {
    return (
      <amplify-button onClick={event => this.signOut(event)} data-test="sign-out-button">
        {this.buttonText}
      </amplify-button>
    );
  }
}
