import { Component, State, Prop, h, Host } from '@stencil/core';
import {
  AuthState,
  CognitoUserInterface,
  FederatedConfig,
  UsernameAliasStrings,
  AuthStateHandler,
} from '../../common/types/auth-types';
import {
  AUTH_CHANNEL,
  NO_AUTH_MODULE_FOUND,
  REDIRECTED_FROM_HOSTED_UI,
  AUTHENTICATOR_AUTHSTATE,
  UI_AUTH_CHANNEL,
  TOAST_AUTH_ERROR_EVENT,
} from '../../common/constants';
import { Auth, appendToCognitoUserAgent } from '@aws-amplify/auth';
import { Hub, Logger } from '@aws-amplify/core';
import { dispatchAuthStateChangeEvent, onAuthUIStateChange } from '../../common/helpers';
import { checkContact } from '../../common/auth-helpers';

const logger = new Logger('Authenticator');

/**
 * @slot sign-in - Content placed inside of the sign in workflow for when a user wants to sign into their account
 * @slot confirm-sign-in - Content placed inside of the confirm sign in workflow for when a user needs to confirm the account they signed in with
 * @slot sign-up - Content placed inside of the sign up workflow for when a user wants to register a new account
 * @slot confirm-sign-up - Content placed inside of the confirm sign up workflow for when a user needs to confirm the account they signed up with
 * @slot forgot-password - Content placed inside of the forgot password workflow for when a user wants to reset their password
 * @slot require-new-password - Content placed inside of the require new password workflow for when a user is required to update their password
 * @slot verify-contact - Content placed inside of the verify-contact workflow for when a user must verify their contact information
 * @slot totp-setup - Content placed inside of the totp-setup workflow for when a user opts to use TOTP MFA
 * @slot greetings - Content placed inside of the greetings navigation for when a user is signed in
 * @slot loading - Content placed inside of the loading workflow for when the app is loading
 */
@Component({
  tag: 'amplify-authenticator',
  styleUrl: 'amplify-authenticator.scss',
  shadow: true,
})
export class AmplifyAuthenticator {
  /** Initial starting state of the Authenticator component. E.g. If `signup` is passed the default component is set to AmplifySignUp */
  @Prop() initialAuthState: AuthState.SignIn | AuthState.SignUp = AuthState.SignIn;
  /** Federated credentials & configuration. */
  @Prop() federated: FederatedConfig;
  /** Username Alias is used to setup authentication with `username`, `email` or `phone_number`  */
  @Prop() usernameAlias: UsernameAliasStrings;
  /** Callback for Authenticator state machine changes */
  @Prop() handleAuthStateChange: AuthStateHandler = () => {};

  @State() authState: AuthState = AuthState.Loading;
  @State() authData: CognitoUserInterface;
  @State() toastMessage: string = '';

  private handleExternalAuthEvent = ({ payload }) => {
    switch (payload.event) {
      case 'cognitoHostedUI':
      case 'signIn':
        checkContact(payload.data, dispatchAuthStateChangeEvent);
        break;
      case 'cognitoHostedUI_failure':
      case 'parsingUrl_failure':
      case 'signOut':
      case 'customGreetingSignOut':
        return dispatchAuthStateChangeEvent(this.initialAuthState);
    }
  };

  private handleToastEvent = ({ payload }) => {
    switch (payload.event) {
      case TOAST_AUTH_ERROR_EVENT:
        if (payload.message) this.toastMessage = payload.message;
        break;
    }
  };

  async componentWillLoad() {
    onAuthUIStateChange((authState, authData) => {
      this.onAuthStateChange(authState, authData as CognitoUserInterface);
      this.toastMessage = '';
    });
    Hub.listen(UI_AUTH_CHANNEL, this.handleToastEvent);
    Hub.listen(AUTH_CHANNEL, this.handleExternalAuthEvent);

    appendToCognitoUserAgent('amplify-authenticator');
    const byHostedUI = localStorage.getItem(REDIRECTED_FROM_HOSTED_UI);
    localStorage.removeItem(REDIRECTED_FROM_HOSTED_UI);
    if (byHostedUI !== 'true') await this.checkUser();
  }

  private async checkUser() {
    if (!Auth || typeof Auth.currentAuthenticatedUser !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }

    try {
      const user = await Auth.currentAuthenticatedUser();
      dispatchAuthStateChangeEvent(AuthState.SignedIn, user);
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
        dispatchAuthStateChangeEvent(this.initialAuthState);
      } catch (error) {
        logger.debug('Failed to sign out', error);
      }
    }
  }

  private async onAuthStateChange(nextAuthState: AuthState, data?: CognitoUserInterface) {
    if (nextAuthState === undefined) return logger.error('nextAuthState cannot be undefined');

    logger.info('Inside onAuthStateChange Method current authState:', this.authState);

    if (nextAuthState === AuthState.SignedOut) {
      this.authState = this.initialAuthState;
    } else {
      this.authState = nextAuthState;
    }

    this.authData = data;
    if (this.authData) logger.log('Auth Data was set:', this.authData);

    if (this.authState === nextAuthState) {
      this.handleAuthStateChange(this.authState, this.authData);
      logger.info(`authState has been updated to ${this.authState}`);
    }
  }

  private renderAuthComponent(authState: AuthState) {
    switch (authState) {
      case AuthState.SignIn:
        return (
          <slot name="sign-in">
            <amplify-sign-in federated={this.federated} usernameAlias={this.usernameAlias} />
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
            <amplify-sign-up usernameAlias={this.usernameAlias} />
          </slot>
        );
      case AuthState.ConfirmSignUp:
        return (
          <slot name="confirm-sign-up">
            <amplify-confirm-sign-up user={this.authData} usernameAlias={this.usernameAlias} />
          </slot>
        );
      case AuthState.ForgotPassword:
        return (
          <slot name="forgot-password">
            <amplify-forgot-password usernameAlias={this.usernameAlias} />
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

  componentWillUnload() {
    Hub.remove(AUTH_CHANNEL, this.handleExternalAuthEvent);
    Hub.remove(UI_AUTH_CHANNEL, this.handleToastEvent);
    return onAuthUIStateChange;
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
        {this.authState === AuthState.SignedIn ? (
          this.renderAuthComponent(this.authState)
        ) : (
          <div class="auth-container">{this.renderAuthComponent(this.authState)}</div>
        )}
      </Host>
    );
  }
}
