import { Auth } from '@aws-amplify/auth';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { Component, h, Prop } from '@stencil/core';

import { AUTH_SOURCE_KEY, NO_AUTH_MODULE_FOUND, SIGN_IN_WITH_FACEBOOK } from '../../common/constants';
import { AuthState, FederatedConfig } from '../../common/types/auth-types';

const logger = new Logger('amplify-facebook-button');

@Component({
  tag: 'amplify-facebook-button',
  shadow: false,
})
export class AmplifyFacebookButton {
  /** App-specific client ID from Facebook */
  @Prop() appId: FederatedConfig['facebookAppId'];
  /** Passed from the Authenticator component in order to change Authentication state
   * e.g. SignIn -> 'Create Account' link -> SignUp
   */
  @Prop() handleAuthStateChange: (nextAuthState: AuthState, data?: object) => void;

  constructor() {
    this.handleClick = this.handleClick.bind(this);
  }

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
  handleClick = event => {
    event.preventDefault();

    window['FB'].init({
      appId: this.appId,
      cookie: true,
      xfbml: false,
      version: 'v5.0',
    });

    this.getLoginStatus();
  };

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
      <amplify-sign-in-button onClick={this.handleClick} provider="facebook">
        <script async defer src="https://connect.facebook.net/en_US/sdk.js"></script>

        <svg slot="icon" viewBox="0 0 279 538" xmlns="http://www.w3.org/2000/svg">
          <g id="Page-1" fill="none" fillRule="evenodd">
            <g id="Artboard" fill="#FFF">
              <path
                d="M82.3409742,538 L82.3409742,292.936652 L0,292.936652 L0,196.990154 L82.2410458,196.990154 L82.2410458,126.4295 C82.2410458,44.575144 132.205229,0 205.252865,0 C240.227794,0 270.306232,2.59855099 279,3.79788222 L279,89.2502322 L228.536175,89.2502322 C188.964542,89.2502322 181.270057,108.139699 181.270057,135.824262 L181.270057,196.89021 L276.202006,196.89021 L263.810888,292.836708 L181.16913,292.836708 L181.16913,538 L82.3409742,538 Z"
                id="Fill-1"
              />
            </g>
          </g>
        </svg>

        {SIGN_IN_WITH_FACEBOOK}
      </amplify-sign-in-button>
    );
  }
}
