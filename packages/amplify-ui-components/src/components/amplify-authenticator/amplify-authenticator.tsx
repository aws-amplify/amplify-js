import { Component, State, Prop, h } from '@stencil/core';
import { AuthState, CognitoUserInterface, FederatedConfig } from '../../common/types/auth-types';
import { AuthStateTunnel } from '../../data/auth-state';
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
  @Prop() federated: FederatedConfig = {};

  componentWillLoad() {
    // try {
    //   const data = await Auth.verifiedContact(user);
    // } catch (error) {

    // }
    // async checkContact(user) {
    //   try {
    //     const data = await Auth.verifiedContact(user);
    //     logger.debug('verified user attributes', data);
    //     if (!JS.isEmpty(data.verified)) {
    //       this.handleStateChange('signedIn', user);
    //     } else {
    //       user = Object.assign(user, data);
    //       this.handleStateChange('verifyContact', user);
    //     }
    //   } catch (e) {
    //     logger.warn('Failed to verify contact', e);
    //     this.handleStateChange('signedIn', user);
    //   }
    // }
    this.authState = this.initialAuthState;

    const byHostedUI = localStorage.getItem('amplify-signin-with-hostedUI');
    localStorage.removeItem('amplify-signin-with-hostedUI');
    if (byHostedUI !== 'true') this.checkUser();
  }

  checkUser() {
    if (!Auth || typeof Auth.currentAuthenticatedUser !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }
    return Auth.currentAuthenticatedUser()
      .then(user => {
        // if (!this._isMounted) {
        //   return;
        // }
        this.onAuthStateChange(AuthState.SignedIn, user);
      })
      .catch(err => {
        // if (!this._isMounted) {
        //   return;
        // }
        let cachedAuthState = null;
        try {
          cachedAuthState = localStorage.getItem('amplify-authenticator-authState');
        } catch (e) {
          logger.debug('Failed to get the auth state from local storage', e);
        }
        const promise = cachedAuthState === AuthState.SignedIn ? Auth.signOut() : Promise.resolve();
        promise
          .then(() => this.onAuthStateChange(this.initialAuthState))
          .catch(e => {
            logger.debug('Failed to sign out', e);
          });
      });
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
      case AuthState.Loading:
        return <div>Loading...</div>;
    }
  }

  render() {
    const tunnelState = {
      authState: this.authState,
      onAuthStateChange: this.onAuthStateChange,
    };

    return (
      <AuthStateTunnel.Provider state={tunnelState}>
        {this.renderAuthComponent(this.authState)}
        <div hidden={this.authState !== AuthState.SignedIn}>
          <amplify-greetings handleAuthStateChange={this.onAuthStateChange} user={this.authData} />
          <slot />
        </div>
      </AuthStateTunnel.Provider>
    );
  }
}
