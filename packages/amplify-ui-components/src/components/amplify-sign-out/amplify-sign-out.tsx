import { Auth } from '@aws-amplify/auth';
import { I18n } from '@aws-amplify/core';
import { Component, Prop, h } from '@stencil/core';
import { NO_AUTH_MODULE_FOUND } from '../../common/constants';
import { AuthState, AuthStateHandler } from '../../common/types/auth-types';
import { dispatchToastHubEvent, dispatchAuthStateChangeEvent } from '../../common/helpers';
import { Translations } from '../../common/Translations';

@Component({
  tag: 'amplify-sign-out',
  shadow: true,
})
export class AmplifySignOut {
  /** Auth state change handler for this component */
  @Prop() handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;
  /** Text inside of the Sign Out button */
  @Prop() buttonText: string = I18n.get(Translations.SIGN_OUT);

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
      <amplify-button slot="sign-out" onClick={event => this.signOut(event)} data-test="sign-out-button">
        {this.buttonText}
      </amplify-button>
    );
  }
}
