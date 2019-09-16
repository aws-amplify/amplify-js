import { Component, FunctionalComponent as FC, Prop, h } from '@stencil/core';
import { forgotPasswordLink, signInFormFooter } from './amplify-sign-in.styles';

const SIGN_IN_FORM_HEADER = "Sign into your account";

interface AmplifyForgotPasswordLinkProps {
  forgotPasswordText: string;
  resetPasswordText: string;
}

interface SignInFormFooterProps {
  submitButtonText: string;
  noAccountText: string;
  createAccountText: string;
  overrideStyle?: boolean;
}

const AmplifyForgotPasswordLink: FC<AmplifyForgotPasswordLinkProps> = ({ forgotPasswordText, resetPasswordText }) => (
  <div class={forgotPasswordLink}>
    <span>{forgotPasswordText} </span>
    <span><amplify-link>{resetPasswordText}</amplify-link></span>
  </div>
);

const SignInFormFooter: FC<SignInFormFooterProps> = ({ submitButtonText, noAccountText, createAccountText, overrideStyle = false }) => (
  <div class={signInFormFooter}>
    <span>{noAccountText} <amplify-link>{createAccountText}</amplify-link></span>
    <amplify-button type="submit" overrideStyle={overrideStyle}>{submitButtonText}</amplify-button>
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
        <div slot="amplify-form-section-footer">
          <SignInFormFooter  submitButtonText="Sign in" createAccountText="Create account" noAccountText="No account?" />
        </div>
      </amplify-form-section>
    );
  }
}
