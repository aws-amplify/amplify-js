import { Component, State, Prop, h } from '@stencil/core';
import { AuthState, User } from '../../common/types/auth-types';
import { AuthStateTunnel } from '../../data/auth-state';

@Component({
  tag: 'amplify-authenticator',
  shadow: false,
})
export class AmplifyAuthenticator {
  /** Initial starting state of the Authenticator component. E.g. If `signup` is passed the default component is set to AmplifySignUp */
  @Prop() initialAuthState: AuthState = AuthState.SignIn;
  /** Used as a flag in order to trigger the content displayed */
  @State() authState: AuthState = AuthState.Loading;

  @State() authData: User;

  componentWillLoad() {
    this.authState = this.initialAuthState;
  }

  onAuthStateChange = (nextAuthState: AuthState, data?: object) => {
    // Possibly add a if (data) this.data = data;
    // Can make it a State Prop
    if (nextAuthState === undefined) return console.info('nextAuthState cannot be undefined');

    console.info('Inside onAuthStateChange Method current authState:', this.authState);
    this.authState = nextAuthState;
    if (data !== undefined) {
      this.authData = data;
      console.log('Auth Data was set:', this.authData);
    }
    console.info(`authState has been updated to ${this.authState}`);
  };

  renderAuthComponent(authState: AuthState) {
    switch (authState) {
      case AuthState.Loading:
        return <div>Loading...</div>;
      case AuthState.SignIn:
        return <amplify-sign-in handleAuthStateChange={this.onAuthStateChange} />;
      case AuthState.SignOut:
        // TODO: add sign out component
        return <div>Sign Out Component</div>;
      case AuthState.SignUp:
        return <amplify-sign-up handleAuthStateChange={this.onAuthStateChange} />;
      case AuthState.ConfirmSignUp:
        return <amplify-confirm-sign-up handleAuthStateChange={this.onAuthStateChange} userData={this.authData} />;
      case AuthState.ForgotPassword:
        return <amplify-forgot-password handleAuthStateChange={this.onAuthStateChange} />;
      case AuthState.ResetPassword:
        // TODO: add forgot password component
        return <div>Reset Password Component</div>;
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
      </AuthStateTunnel.Provider>
    );
  }
}
