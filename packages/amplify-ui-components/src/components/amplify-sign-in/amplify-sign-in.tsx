import { Component, FunctionalComponent as FC, Prop, h } from '@stencil/core';
import { forgotPasswordLink } from './amplify-sign-in.styles';

const SIGN_IN_FORM_HEADER = "Sign into your account";

interface AmplifyForgotPasswordLinkProps {
  forgotPasswordText: string;
  resetPasswordText: string;
}

const AmplifyForgotPasswordLink: FC<AmplifyForgotPasswordLinkProps> = ({ forgotPasswordText, resetPasswordText }) => (
  <div class={forgotPasswordLink}>
    <span>{forgotPasswordText} </span>
    <span><a href="javascript:void">{resetPasswordText}</a></span>
  </div>
);

@Component({
  tag: 'amplify-sign-in',
  shadow: false,
})
export class AmplifySignIn {
  @Prop() handleSubmit: (Event) => void;
  @Prop() validationErrors: boolean = false;
  @Prop() overrideStyle: boolean = false;

  render() {
    return (
      <amplify-form-section headerText={SIGN_IN_FORM_HEADER} overrideStyle={this.overrideStyle} handleSubmit={this.handleSubmit}>
        <amplify-form-field fieldId="sign-in-username" label="Username*" placeholder="Enter your username" />
        <amplify-form-field fieldId="sign-in-password" label="Password*" placeholder="Enter your password" type="password" />
        <AmplifyForgotPasswordLink forgotPasswordText="Forgot your password?" resetPasswordText="Reset password" />
      </amplify-form-section>
    );
  }
}
