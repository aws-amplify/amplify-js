import { Auth } from '@aws-amplify/auth';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { Component, h, Prop } from '@stencil/core';

import { AUTH_SOURCE_KEY, NO_AUTH_MODULE_FOUND, SIGN_IN_WITH_FACEBOOK } from '../../common/constants';
import { AuthState, FederatedConfig, AuthStateHandler } from '../../common/types/auth-types';
import { dispatchAuthStateChangeEvent } from '../../common/helpers';

const logger = new Logger('amplify-facebook-button');

@Component({
  tag: 'amplify-facebook-button',
  shadow: true,
})
export class AmplifyFacebookButton {
  /** App-specific client ID from Facebook */
  @Prop() appId: FederatedConfig['facebookAppId'];
  /** Passed from the Authenticator component in order to change Authentication state
   * e.g. SignIn -> 'Create Account' link -> SignUp
   */
  @Prop() handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;

  federatedSignIn = authResponse => {
    const { accessToken, expiresIn } = authResponse;

    if (!accessToken) {
      return;
    }

    if (!Auth || typeof Auth.federatedSignIn !== 'function' || typeof Auth.currentAuthenticatedUser !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }

    const date = new Date();
    const expires_at = expiresIn * 1000 + date.getTime();
    const fields = 'name,email';

    window['FB'].api('/me', { fields }, async response => {
      const user = {
        name: response.name,
        email: response.email,
      };

      await Auth.federatedSignIn('facebook', { token: accessToken, expires_at }, user);

      const authenticatedUser = await Auth.currentAuthenticatedUser();

      this.handleAuthStateChange(AuthState.SignedIn, authenticatedUser);
    });
  };

  getLoginStatus = () => {
    window['FB'].getLoginStatus(response => {
      try {
        window.localStorage.setItem(AUTH_SOURCE_KEY, JSON.stringify({ provider: 'facebook' }));
      } catch (e) {
        logger.debug('Failed to cache auth source into localStorage', e);
      }

      if (response.status === 'connected') {
        return this.federatedSignIn(response.authResponse);
      }

      this.login();
    });
  };

  /**
   * @see https://developers.facebook.com/docs/javascript/reference/FB.init/v5.0
   */
  signInWithFacebook(event) {
    event.preventDefault();

    window['FB'].init({
      appId: this.appId,
      cookie: true,
      xfbml: false,
      version: 'v5.0',
    });

    this.getLoginStatus();
  }

  login = () => {
    const scope = 'public_profile,email';

    window['FB'].login(
      response => {
        if (response && response.authResponse) {
          this.federatedSignIn(response.authResponse);
        }
      },
      { scope },
    );
  };

  render() {
    return (
      <amplify-sign-in-button onClick={event => this.signInWithFacebook(event)} provider="facebook">
        <script async defer src="https://connect.facebook.net/en_US/sdk.js"></script>
        {SIGN_IN_WITH_FACEBOOK}
      </amplify-sign-in-button>
    );
  }
}
