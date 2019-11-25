import { Auth } from '@aws-amplify/auth';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { Component, h, Prop } from '@stencil/core';

import { AUTH_SOURCE_KEY, NO_AUTH_MODULE_FOUND, SIGN_IN_WITH_GOOGLE } from '../../common/constants';
import { AuthState, FederatedConfig, AuthStateHandler } from '../../common/types/auth-types';

const logger = new Logger('amplify-google-button');

@Component({
  tag: 'amplify-google-button',
  shadow: false,
})
export class AmplifyGoogleButton {
  /** Passed from the Authenticator component in order to change Authentication state
   * e.g. SignIn -> 'Create Account' link -> SignUp
   */
  @Prop() handleAuthStateChange: AuthStateHandler;
  /** App-specific client ID from Google */
  @Prop() clientId: FederatedConfig['googleClientId'];

  getAuthInstance() {
    if (window['gapi'] && window['gapi'].auth2) {
      return (
        window['gapi'].auth2.getAuthInstance() ||
        window['gapi'].auth2.init({
          client_id: this.clientId,
          cookiepolicy: 'single_host_origin',
          scope: 'profile email openid',
        })
      );
    }

    return null;
  }

  signInWithGoogle(event) {
    event.preventDefault();

    this.getAuthInstance()
      .signIn()
      .then(this.handleUser)
      .catch(this.handleError);
  }

  handleError = error => {
    console.error(error);
  };

  /**
   * @see https://developers.google.com/identity/sign-in/web/build-button#building_a_button_with_a_custom_graphic
   */
  handleLoad = () => {
    window['gapi'].load('auth2');
  };

  handleUser = async user => {
    if (!Auth || typeof Auth.federatedSignIn !== 'function' || typeof Auth.currentAuthenticatedUser !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }

    try {
      window.localStorage.setItem(AUTH_SOURCE_KEY, JSON.stringify({ provider: 'google' }));
    } catch (e) {
      logger.debug('Failed to cache auth source into localStorage', e);
    }

    const { id_token, expires_at } = user.getAuthResponse();
    const profile = user.getBasicProfile();

    await Auth.federatedSignIn(
      'google',
      { token: id_token, expires_at },
      {
        email: profile.getEmail(),
        name: profile.getName(),
        picture: profile.getImageUrl(),
      },
    );

    const authenticatedUser = await Auth.currentAuthenticatedUser();

    try {
      this.handleAuthStateChange(AuthState.SignedIn, authenticatedUser);
    } catch (error) {
      this.handleError(error);
    }
  };

  render() {
    return (
      <amplify-sign-in-button onClick={event => this.signInWithGoogle(event)} provider="google">
        <script onLoad={this.handleLoad} src="https://apis.google.com/js/api:client.js"></script>

        <svg slot="icon" viewBox="0 0 256 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
          <path
            d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
            fill="#4285F4"
          />
          <path
            d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
            fill="#34A853"
          />
          <path
            d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
            fill="#FBBC05"
          />
          <path
            d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
            fill="#EB4335"
          />
        </svg>

        {SIGN_IN_WITH_GOOGLE}
      </amplify-sign-in-button>
    );
  }
}
