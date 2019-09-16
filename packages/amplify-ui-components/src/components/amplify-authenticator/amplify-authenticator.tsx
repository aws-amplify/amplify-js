import { Component, State, Prop, Event, EventEmitter, Watch, h } from '@stencil/core';
import { AuthState, UserData, Creds } from './types';
import Tunnel from './Tunnel';

@Component({
  tag: 'amplify-authenticator',
})
export class AmplifyAuthenticator {
  @Prop() signIn: Function;
  @Prop() content: Function;
  @Prop() override: boolean = false;

  @State() authState: AuthState = AuthState.LoggedOut;
  @State() userData: UserData = {};
  @State() validationErrors: string;
  @Event() authStateChange: EventEmitter;

  @Watch('authState')
  watchAuthState(authState) {
    this.authStateChange.emit(authState);
  }

  private creds: Creds = {};

  private handleUsernameChange = event => {
    this.creds.username = event.target.value;
  };

  private handlePasswordChange = event => {
    this.creds.password = event.target.value;
  };

  private handleSignInSubmit = event => {
    event.preventDefault();
    event.stopPropagation();

    console.log('amplify-authenticator signIn', this.creds);
    if (!this.creds.username || !this.creds.password) {
      this.validationErrors = 'empty fields';
      return;
    }

    this.validationErrors = null;

    // TODO: sign-in using Amplify Auth module

    this.authState = AuthState.LoggedIn;
    this.userData = { username: this.creds.username };
    this.creds = {};
  };

  private handleSignOut = () => {
    this.authState = AuthState.LoggedOut;
    this.userData = {};
    this.creds = {};
  };

  render() {
    const tunnerState = {
      handleUsernameChange: this.handleUsernameChange,
      handlePasswordChange: this.handlePasswordChange,
    };
    const signInProps = { handleSubmit: this.handleSignInSubmit, validationErrors: this.validationErrors, overrideStyle: this.override };
    const contentProps = { ...this.userData, signOut: this.handleSignOut };
    return (
      <Tunnel.Provider state={tunnerState}>
        {this.authState === AuthState.LoggedOut &&
          (this.signIn ? this.signIn(signInProps) : <amplify-sign-in {...signInProps} />)}
        {this.authState === AuthState.LoggedIn && this.content && this.content(contentProps)}
      </Tunnel.Provider>
    );
  }
}
