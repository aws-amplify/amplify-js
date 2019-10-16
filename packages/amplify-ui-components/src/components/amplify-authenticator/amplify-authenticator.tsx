import { Component, State, Prop, h } from '@stencil/core';
import { AuthState, authenticatorMapping } from './types';
import Tunnel from '../../data/auth-state';

@Component({
  tag: 'amplify-authenticator',
  shadow: false,
})
export class AmplifyAuthenticator {
  /** Initial starting state of the Authenticator component. E.g. If `signup` is passed the default component is set to AmplifySignUp */
  @Prop() state: string = 'loading';
  /** First initial load when the component mounts in order to set Loading to SignIn by default */
  @State() firstInitialLoad: boolean = true;
  /** Used as a flag in order to trigger the content displayed */
  @State() authState: AuthState = AuthState.Loading;

  onAuthStateChange = (nextAuthState?: string) => {
    if (nextAuthState === undefined) return console.info('nextAuthState cannot be undefined');

    // TODO add Logger
    console.info('Inside onAuthStateChange Method current authState:', this.authState);
    this.authState = authenticatorMapping[nextAuthState];

    // TODO add Logger
    console.info(`authState has been updated to ${this.authState}`);
    return this.buildUIContent(this.authState);
  };

  buildUIContent(authState: AuthState) {
    if (authState === 'loading') {
      // TODO: add loading component
      return 'Loading...';
    }
    if (authState === 'signin') {
      return <amplify-sign-in />;
    }
    if (authState === 'signout') {
      // TODO: add sign out component
      return <div>Sign Out Component</div>;
    }
    if (authState === 'signup') {
      // TODO: add sign up component
      return <amplify-sign-up />;
    }
    if (authState === 'forgotpassword') {
      // TODO: add forgot password component
      return <div>Forgot Password Component</div>;
    }
  }
  /**
   * When the componentDidLoad is triggered, this method is triggered in order to
   * handle the component to displayed to the view. If the component has `firstInitialLoad`
   * set to `true` and `this.state` is set to 'loading', the default component displayed
   * is set to `AmplifySignIn`
   */
  handleStateChange() {
    if (this.firstInitialLoad) {
      if (this.state == AuthState.Loading) {
        this.authState = AuthState.SignIn;
        this.firstInitialLoad = false;

        return this.buildUIContent(this.authState);
      } else {
        return this.buildUIContent((this.authState = authenticatorMapping[this.state]));
      }
    }
    return this.buildUIContent((this.authState = authenticatorMapping[this.state]));
  }

  componentDidLoad() {
    this.handleStateChange();
  }

  render() {
    const tunnelState = {
      authState: this.authState,
      onAuthStateChange: this.onAuthStateChange,
    };
    return <Tunnel.Provider state={tunnelState}>{this.buildUIContent(this.authState)}</Tunnel.Provider>;
  }
}
