import { Component, State, Prop, h, Host } from '@stencil/core';
import { AuthState, CognitoUserInterface, FederatedConfig } from '../../common/types/auth-types';
import { NO_AUTH_MODULE_FOUND, SIGNING_IN_WITH_HOSTEDUI_KEY, AUTHENTICATOR_AUTHSTATE } from '../../common/constants';
import { Auth } from '@aws-amplify/auth';
import { Logger } from '@aws-amplify/core';

const logger = new Logger('Authenticator');

@Component({
  tag: 'amplify-authenticator',
  shadow: false,
})
export class AmplifyAuthenticator {
  /** Initial starting state of the Authenticator component. E.g. If `signup` is passed the default component is set to AmplifySignUp */
  @Prop() initialAuthState: AuthState = AuthState.SignIn;
  /** Used as a flag in order to trigger the content displayed */
  @State() authState: AuthState = AuthState.Loading;

  @State() authData: CognitoUserInterface;
  /** Federated credentials & configuration. */
  @Prop() federated: FederatedConfig;

  async componentWillLoad() {
    const byHostedUI = localStorage.getItem(SIGNING_IN_WITH_HOSTEDUI_KEY);
    localStorage.removeItem(SIGNING_IN_WITH_HOSTEDUI_KEY);
    if (byHostedUI !== 'true') await this.checkUser();
  }

  async checkUser() {
    if (!Auth || typeof Auth.currentAuthenticatedUser !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }

    try {
      const user = await Auth.currentAuthenticatedUser();
      this.onAuthStateChange(AuthState.SignedIn, user);
    } catch (error) {
      let cachedAuthState = null;
      try {
        cachedAuthState = localStorage.getItem(AUTHENTICATOR_AUTHSTATE);
      } catch (error) {
        logger.debug('Failed to get the auth state from local storage', error);
      }
      try {
        if (cachedAuthState === AuthState.SignedIn) {
          await Auth.signOut();
        }
        this.onAuthStateChange(this.initialAuthState);
      } catch (error) {
        logger.debug('Failed to sign out', error);
      }
    }
  }

  onAuthStateChange = (nextAuthState: AuthState, data?: CognitoUserInterface) => {
    if (nextAuthState === undefined) return logger.info('nextAuthState cannot be undefined');

    logger.info('Inside onAuthStateChange Method current authState:', this.authState);
    if (nextAuthState === AuthState.SignedOut) {
      this.authState = this.initialAuthState;
    } else {
      this.authState = nextAuthState;
    }

    if (data !== undefined) {
      this.authData = data;
      logger.log('Auth Data was set:', this.authData);
    }
    logger.info(`authState has been updated to ${this.authState}`);
  };

  renderAuthComponent(authState: AuthState) {
    switch (authState) {
      case AuthState.SignIn:
        return <amplify-sign-in federated={this.federated} handleAuthStateChange={this.onAuthStateChange} />;
      case AuthState.ConfirmSignIn:
        return <amplify-confirm-sign-in handleAuthStateChange={this.onAuthStateChange} user={this.authData} />;
      case AuthState.SignUp:
        return <amplify-sign-up handleAuthStateChange={this.onAuthStateChange} />;
      case AuthState.ConfirmSignUp:
        return <amplify-confirm-sign-up handleAuthStateChange={this.onAuthStateChange} user={this.authData} />;
      case AuthState.ForgotPassword:
        return <amplify-forgot-password handleAuthStateChange={this.onAuthStateChange} />;
      case AuthState.ResetPassword:
        return <amplify-require-new-password handleAuthStateChange={this.onAuthStateChange} user={this.authData} />;
      case AuthState.VerifyContact:
        return <amplify-verify-contact handleAuthStateChange={this.onAuthStateChange} user={this.authData} />;
      case AuthState.TOTPSetup:
        return <amplify-totp-setup handleAuthStateChange={this.onAuthStateChange} user={this.authData} />;
      case AuthState.Loading:
        return <div>Loading...</div>;
      case AuthState.SignedIn:
        return <amplify-greetings handleAuthStateChange={this.onAuthStateChange} user={this.authData} />;
      default:
        throw new Error(`Unhandled auth state: ${authState}`);
    }
  }

  render() {
    return (
      <Host>
        {this.renderAuthComponent(this.authState)}
        <div hidden={this.authState !== AuthState.SignedIn}>
          <slot />
        </div>
      </Host>
    );
  }
}
