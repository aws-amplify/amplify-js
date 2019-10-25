import { Component, State, Prop, h } from '@stencil/core';
import { AuthState } from '../../common/types/auth-types';
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

  componentWillLoad() {
    this.authState = this.initialAuthState;
  }

  onAuthStateChange = (nextAuthState: AuthState, data?: object) => {
    console.log(data);
    if (nextAuthState === undefined) return console.info('nextAuthState cannot be undefined');

    console.info('Inside onAuthStateChange Method current authState:', this.authState);
    this.authState = nextAuthState;
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
        // TODO: add confirm sign up component
        return <div>Confirm Sign Up Component</div>;
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
