import { Component, Prop, h } from '@stencil/core';
import { SIGN_OUT, NO_AUTH_MODULE_FOUND } from '../../common/constants';
import { AuthState } from '../../common/types/auth-types';
import { Logger } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';

const logger = new Logger('SignOut');

@Component({
  tag: 'amplify-totp',
  shadow: false,
})
export class AmplifyTOTP {
  /** Passed from the Authenticatior component in order to change Authentication state */
  @Prop() handleAuthStateChange: (nextAuthState: AuthState, data?: object) => void;
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
      <amplify-button overrideStyle={this.overrideStyle} onClick={event => this.signOut(event)}>
        {this.buttonText}
      </amplify-button>
    );
  }
}
