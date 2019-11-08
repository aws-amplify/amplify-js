import { Component, h, Prop, State } from '@stencil/core';
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

  @State() showGreetingMessage: boolean = false;

  render() {
    if (this.user !== null) this.showGreetingMessage = true;
    return (
      <header class={greetings}>
        {this.logo && <span>Logo</span>}
        <amplify-nav-bar>
          {this.showGreetingMessage && <span>Hello, {this.user.username}</span>}
          <amplify-sign-out />
        </amplify-nav-bar>
      </header>
    );
  }
}
