import { Component, h, Prop, FunctionalComponent } from '@stencil/core';
import { AuthStateHandler } from '../../common/types/auth-types';
import { dispatchAuthStateChangeEvent } from '../../common/helpers';
@Component({
  tag: 'amplify-greetings',
  styleUrl: 'amplify-greetings.scss',
  shadow: true,
})
export class AmplifyGreetings {
  /** Username displayed in the greetings */
  @Prop() username: string = null;
  /** Logo displayed inside of the header */
  @Prop() logo: FunctionalComponent | null = null;
  /** Auth state change handler for this component */
  @Prop() handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;

  render() {
    return (
      <header class="greetings">
        {// TODO: user <amplify-logo> instead of <span>
        this.logo && <span>{this.logo}</span>}
        <amplify-nav>
          {this.username && <span slot="greetings-message">Hello, {this.username}</span>}
          <amplify-sign-out handleAuthStateChange={this.handleAuthStateChange} />
        </amplify-nav>
      </header>
    );
  }
}
