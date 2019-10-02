import { Component, State, Prop, h } from '@stencil/core';
import { AuthState, authenticatorMapping } from './types';
import Tunnel from '../../data/auth-state';

let content;

@Component({
  tag: 'amplify-authenticator',
  shadow: false,
})
export class AmplifyAuthenticator {
  /** Allows customers to pass a starting state e.g. signup for which component will show */
  @Prop() state: string = 'loading';
  /** First initial load when the component mounts in order to set Loading to SignIn by default */
  @State() firstInitialLoad: boolean = true;
  /** Used as a flag in order to trigger the content displayed */
  @State() authState: AuthState = AuthState.Loading;
  
  onAuthStateChange = (stateOfAuth?: string) => {
    if (stateOfAuth === undefined) return console.info('stateOfAuth cannot be undefined');

    console.info('Inside onAuthStateChange Method current authState:', this.authState);
    this.authState = authenticatorMapping[stateOfAuth];

    console.info(`authState has been updated to ${this.authState}`);
    return this.buildUIContent(this.authState);
  }

  buildUIContent(authState) {
    if (authState === 'loading') {
      // TODO: add loading component
      content = 'Loading...';
    }
    if(authState === 'signin') {
      content = <amplify-sign-in />
    }
    if (authState === 'signout') {
      // TODO: add sign out component
      content = <div>Sign Out Component</div>
    }
    if (authState === 'signup') {
      // TODO: add sign up component
      content = <div>Sign Up Component</div>
    }
    if (authState === 'forgotpassword') {
      // TODO: add forgot password component
      content = <div>Forgot Password Component</div>
    }
  }
  
  handleStateChange() {
    if (this.firstInitialLoad) {
      if (this.state == AuthState.Loading) {
        this.authState = AuthState.SignIn;
        this.firstInitialLoad = false;

        return this.buildUIContent(this.authState);
      } else {
        return this.buildUIContent(this.authState = authenticatorMapping[this.state]);
      }
    }
    return this.buildUIContent(this.authState = authenticatorMapping[this.state]);
  }

  componentDidLoad() {
    this.handleStateChange();
  }

  render() {
    const tunnelState = {
      authState: this.authState,
      onAuthStateChange: this.onAuthStateChange
    };
    return (
      <Tunnel.Provider state={tunnelState}>
        <div>
          {content}
        </div>
      </Tunnel.Provider>
    );
  }
}
