import { Component, Prop, h } from '@stencil/core';
import { SIGN_OUT, NO_AUTH_MODULE_FOUND } from '../../common/constants';
import { AuthState, AuthStateHandler } from '../../common/types/auth-types';
import { Logger } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';

const logger = new Logger('SignOut');

@Component({
  tag: 'amplify-sign-out',
  shadow: false,
})
export class AmplifySignOut {
  /** Passed from the Authenticator component in order to change Authentication state */
  @Prop() handleAuthStateChange: AuthStateHandler;
  /** (Optional) Overrides default styling */
  @Prop() overrideStyle: boolean = false;
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
      logger.error(error);
      throw new Error(error);
    }
  }

  render() {
    return (
      <amplify-button
        overrideStyle={this.overrideStyle}
        onClick={event => this.signOut(event)}
        data-test="sign-out-button"
      >
        {this.buttonText}
      </amplify-button>
    );
  }
}
