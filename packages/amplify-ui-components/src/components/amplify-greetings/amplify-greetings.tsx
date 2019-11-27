import { Component, h, Prop, State, Watch, FunctionalComponent } from '@stencil/core';
import { greetings } from './amplify-greetings.style';
import { AuthStateHandler, CognitoUserInterface } from '../../common/types/auth-types';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';

const STATIC_GREETINGS_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--greetings`;

@Component({
  tag: 'amplify-greetings',
  shadow: false,
})
export class AmplifyGreetings {
  /** Used for the username to be passed to resend code */
  @Prop() user: CognitoUserInterface = null;
  /** Logo displayed inside of the header */
  @Prop() logo: FunctionalComponent | null = null;
  /** Passed from the Authenticator component in order to change Authentication state */
  @Prop() handleAuthStateChange: AuthStateHandler;
  /** Override default styling */
  @Prop() overrideStyle: boolean = false;

  @Watch('user')
  watchHandler(newUserValue: CognitoUserInterface) {
    // If the user passed in has a username, show username greeting message
    if (newUserValue && newUserValue.username) this.showUsernameGreeting = true;
  }

  @State() showUsernameGreeting: boolean = false;

  render() {
    return (
      <header class={styleNuker(this.overrideStyle, STATIC_GREETINGS_CLASS_NAME, greetings)}>
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
