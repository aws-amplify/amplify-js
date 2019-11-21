import { Component, State, Prop, h } from '@stencil/core';
import { AuthState, CognitoUserInterface, FederatedConfig } from '../../common/types/auth-types';
import { AuthStateTunnel } from '../../data/auth-state';

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
    this.authState = this.initialAuthState;
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
