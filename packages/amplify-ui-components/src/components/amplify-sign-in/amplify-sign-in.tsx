import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'amplify-sign-in',
})
export class AmplifySignIn {
  @Prop() handleSubmit: (Event) => void;
  @Prop() validationErrors: string;
  @Prop() overrideStyle?: boolean = false;

  render() {
    return (
      <amplify-section override-style={this.overrideStyle}>
        <amplify-section-header override-style={this.overrideStyle}>Sign in to your account</amplify-section-header>
        <form onSubmit={this.handleSubmit}>
          <amplify-sign-in-username-field />
          <amplify-sign-in-password-field />
          {this.validationErrors && <p>{this.validationErrors}</p>}
          <amplify-button type="submit" styleOverride={this.overrideStyle}>Submit</amplify-button>
        </form>
      </amplify-section>
    );
  }
}
