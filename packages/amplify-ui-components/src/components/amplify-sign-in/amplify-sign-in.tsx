import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'amplify-sign-in',
})
export class AmplifySignIn {
  @Prop() handleSubmit: (Event) => void;
  @Prop() validationErrors: string;
  @Prop() overrideStyle: boolean = false;

  render() {
    return (
      <amplify-form-section handleSubmit={this.handleSubmit} headerText="Sign into your account" overrideStyle={this.overrideStyle}>
        <amplify-sign-in-username-field hint="Hint: it's the name of your user" />
        <amplify-sign-in-password-field />
        {this.validationErrors &&
          <div style={{display: "flex"}}>
            <p style={{margin: "0"}}>{this.validationErrors}</p>
            <amplify-tooltip text="Listen up, this validation error is important!">
              <amplify-icon name="sound" overrideStyle={true}>
              </amplify-icon>
            </amplify-tooltip>
          </div>
        }
      </amplify-form-section>
    );
  }
}
