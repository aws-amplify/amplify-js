import { Component, Prop } from '@stencil/core';

@Component({
  tag: 'amplify-sign-in',
})
export class AmplifySignIn {
  @Prop() handleSubmit: (Event) => void;
  @Prop() validationErrors: string;

  render() {
    return (
      <amplify-section>
        <amplify-section-header>
          Sign in to your account
        </amplify-section-header>
        <form onSubmit={this.handleSubmit}>
          <div>
            <p>
              <amplify-sign-in-username-field />
            </p>
            <p>
              <amplify-sign-in-password-field />
            </p>
          </div>
          {this.validationErrors && <p>{this.validationErrors}</p>}
          <amplify-button type="submit">Submit</amplify-button>
        </form>
      </amplify-section>
    );
  }
}
