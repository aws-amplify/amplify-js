import { Component, State, Prop, h, Host } from '@stencil/core';
import { AuthState, CognitoUserInterface, FederatedConfig } from '../../common/types/auth-types';
import {
  NO_AUTH_MODULE_FOUND,
  SIGNING_IN_WITH_HOSTEDUI_KEY,
  AUTHENTICATOR_AUTHSTATE,
  UI_AUTH_CHANNEL,
  TOAST_AUTH_ERROR_EVENT,
  AUTH_STATE_CHANGE_EVENT,
} from '../../common/constants';
import { Auth, appendToCognitoUserAgent } from '@aws-amplify/auth';
import { Hub, Logger } from '@aws-amplify/core';

const logger = new Logger('Authenticator');

@Component({
  tag: 'amplify-authenticator',
  shadow: true,
})
export class AmplifyAuthenticator {
  /** Initial starting state of the Authenticator component. E.g. If `signup` is passed the default component is set to AmplifySignUp */
  @Prop() initialAuthState: AuthState.SignIn | AuthState.SignUp = AuthState.SignIn;
  /** Federated credentials & configuration. */
  @Prop() federated: FederatedConfig;

  @State() authState: AuthState = AuthState.Loading;
  @State() authData: CognitoUserInterface;
  @State() toastMessage: string = '';

  async componentWillLoad() {
    Hub.listen(UI_AUTH_CHANNEL, data => {
      const { payload } = data;
      switch (payload.event) {
        case TOAST_AUTH_ERROR_EVENT:
          if (payload.message) this.toastMessage = payload.message;
          break;
        case AUTH_STATE_CHANGE_EVENT:
          if (payload.message) this.onAuthStateChange(payload.message as AuthState, payload.data);
          break;
        default:
          logger.warn('Unhandled Auth Event', payload.event);
      }
    });

    appendToCognitoUserAgent('amplify-ui');
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
        return (
          <slot name="sign-in">
            <amplify-sign-in federated={this.federated} />
          </slot>
        );
      case AuthState.ConfirmSignIn:
        return (
          <slot name="confirm-sign-in">
            <amplify-confirm-sign-in user={this.authData} />
          </slot>
        );
      case AuthState.SignUp:
        return (
          <slot name="sign-up">
            <amplify-sign-up />
          </slot>
        );
      case AuthState.ConfirmSignUp:
        return (
          <slot name="confirm-sign-up">
            <amplify-confirm-sign-up user={this.authData} />
          </slot>
        );
      case AuthState.ForgotPassword:
        return (
          <slot name="forgot-password">
            <amplify-forgot-password />
          </slot>
        );
      case AuthState.ResetPassword:
        return (
          <slot name="require-new-password">
            <amplify-require-new-password user={this.authData} />
          </slot>
        );
      case AuthState.VerifyContact:
        return (
          <slot name="verify-contact">
            <amplify-verify-contact user={this.authData} />
          </slot>
        );
      case AuthState.TOTPSetup:
        return (
          <slot name="totp-setup">
            <amplify-totp-setup user={this.authData} />
          </slot>
        );
      case AuthState.Loading:
        return (
          <slot name="loading">
            <div>Loading...</div>
          </slot>
        );
      case AuthState.SignedIn:
        return [<slot name="greetings"></slot>, <slot></slot>];
      default:
        throw new Error(`Unhandled auth state: ${authState}`);
    }
  }

  async componentDidUnload() {
    Hub.remove(UI_AUTH_CHANNEL, data => {
      const { payload } = data;
      if (payload.event === TOAST_AUTH_ERROR_EVENT && payload.message) {
        this.toastMessage = payload.message;
      }
    });
  }

  render() {
    return (
      <Host>
        {this.toastMessage ? (
          <amplify-toast
            message={this.toastMessage}
            handleClose={() => {
              this.toastMessage = '';
            }}
            data-test="authenticator-error"
          />
        ) : null}
        {this.renderAuthComponent(this.authState)}
      </Host>
    );
  }
}
