import { Component, h, Prop, State, Watch, FunctionalComponent } from '@stencil/core';
import { AuthStateHandler, CognitoUserInterface } from '../../common/types/auth-types';
import { dispatchAuthStateChangeEvent } from '../../common/helpers';
@Component({
  tag: 'amplify-greetings',
  styleUrl: 'amplify-greetings.scss',
  shadow: true,
})
export class AmplifyGreetings {
  /** Used for the username to be passed to resend code */
  @Prop() user: CognitoUserInterface = null;
  /** Logo displayed inside of the header */
  @Prop() logo: FunctionalComponent | null = null;
  /** Passed from the Authenticator component in order to change Authentication state */
  @Prop() handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;

  @Watch('user')
  watchHandler(newUserValue: CognitoUserInterface) {
    // If the user passed in has a username, show username greeting message
    if (newUserValue && newUserValue.username) this.showUsernameGreeting = true;
  }

  @State() showUsernameGreeting: boolean = false;

  render() {
    return (
      <header class="greetings">
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
