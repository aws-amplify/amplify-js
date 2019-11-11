import { Component, h, Prop, State, Watch } from '@stencil/core';
import { greetings } from './amplify-greetings.style';
import { AuthState, CognitoUserInterface } from '../../common/types/auth-types';

@Component({
  tag: 'amplify-greetings',
  shadow: false,
})
export class AmplifyGreetings {
  /** Used for the username to be passed to resend code */
  @Prop() user: CognitoUserInterface = null;
  /** Items shown in navigation */
  @Prop() navItems: Array<object> = [<span>Hello, {'username'}</span>, <amplify-sign-out />];
  /** Logo displayed inside of the header */
  @Prop() logo: object = null;
  /** Passed from the Authenticatior component in order to change Authentication state */
  @Prop() handleAuthStateChange: (nextAuthState: AuthState, data?: object) => void;

  @Watch('user')
  watchHandler(newUserValue: CognitoUserInterface) {
    // If the user passed in has a username, show username greeting message
    if (newUserValue && newUserValue.username) this.showUsernameGreeting = true;
  }

  @State() showUsernameGreeting: boolean = false;

  render() {
    return (
      <header class={greetings}>
        {// TODO: user <amplify-logo> instead of <span>
        this.logo && <span>Logo</span>}
        <amplify-nav>
          {this.showUsernameGreeting && <span>Hello, {this.user.username}</span>}
          <amplify-sign-out handleAuthStateChange={this.handleAuthStateChange} />
        </amplify-nav>
      </header>
    );
  }
}
