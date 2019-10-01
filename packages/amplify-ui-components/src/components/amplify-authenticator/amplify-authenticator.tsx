import { Component, State, Prop, h } from '@stencil/core';
import { AuthState } from './types';
import Tunnel from '../../data/auth-state';

let content;

const authenticatorMapping = {
  'signup': AuthState.SignUp,
  'signin': AuthState.SignIn,
  'signout': AuthState.SignOut,
  '': AuthState.Loading,
  'loading': AuthState.Loading,
  'forgotpassword': AuthState.ForgotPassword,
};

@Component({
  tag: 'amplify-authenticator',
  shadow: false,
})
export class AmplifyAuthenticator {
  @Prop() state: string = 'loading';
  @State() firstInitialLoad: boolean = true;
  @State() authState: AuthState = AuthState.Loading;

  onAuthStateChange= (stateOfAuth?: string) => {
    if (stateOfAuth === undefined) return console.info('stateOfAuth cannot be undefined');

    // Current auth state
    console.info('Inside onAuthStateChange Method current authState:', this.authState);
    this.authState = authenticatorMapping[stateOfAuth];

    // Updated auth state
    console.info(`authState has been updated to ${this.authState}`);
    return this.buildUIContent(this.authState);
  }

  buildUIContent(authState) {
    if (authState === 'loading') {
      content = 'Loading...';
    }
    if(authState === 'signin') {
      content = <amplify-sign-in />
    }
    if (authState === 'signout') {
      content = <div>Sign Out Component</div>
    }
    if (authState === 'signup') {
      content = <div>Sign Up Component</div>
    }
    if (authState === 'forgotpassword') {
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
