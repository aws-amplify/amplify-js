import { Component, FunctionalComponent as FC, Prop, h } from '@stencil/core';
import { AmplifyForgotPasswordLinkProps, SignInFormFooterProps } from './amplify-sign-in-interface';
import { forgotPasswordLink, signInFormFooter } from './amplify-sign-in.styles';
import { fieldIdTextTypes } from '../../common/types';
import { SIGN_IN_TEXT } from '../../common/constants';

const {
  HEADER_TEXT,
  FORGOT_PASSWORD_TEXT,
  RESET_PASSWORD_TEXT,
  SUBMIT_BUTTON_TEXT,
  CREATE_ACCOUNT_TEXT,
  NO_ACCOUNT_TEXT
} = SIGN_IN_TEXT;

const AmplifyForgotPasswordLink: FC<AmplifyForgotPasswordLinkProps> = ({ forgotPasswordText, resetPasswordText }) => (
  <div class={forgotPasswordLink}>
    {forgotPasswordText} <amplify-link>{resetPasswordText}</amplify-link>
  </div>
);

const SignInFormFooter: FC<SignInFormFooterProps> = ({ submitButtonText, noAccountText, createAccountText, overrideStyle = false }) => (
  <div class={signInFormFooter}>
    <div>{noAccountText} <amplify-link>{createAccountText}</amplify-link></div>
    <amplify-button type="submit" overrideStyle={overrideStyle}>{submitButtonText}</amplify-button>
  </div>
);

@Component({
  tag: 'amplify-sign-in',
  shadow: false,
})
export class AmplifySignIn {
  /** Fires when sign in form is submitted */
  @Prop() handleSubmit: (Event) => void;
  /** Engages when invalid actions occur, such as missing field, etc. */
  @Prop() validationErrors: string;
  /** Used for header text in sign in component */
  @Prop() headerText: string = HEADER_TEXT;
  /** Based on the type of field e.g. sign-in */
  @Prop() fieldIdText: fieldIdTextTypes = 'sign-in';
  /** Used for the forgot password text in sign in component */
  @Prop() forgotPasswordText: string = FORGOT_PASSWORD_TEXT;
  /** Used for the reset password text in sign in component */
  @Prop() resetPasswordText: string = RESET_PASSWORD_TEXT;
  /** Used for the submit button text in sign in component */
  @Prop() submitButtonText: string = SUBMIT_BUTTON_TEXT;
  /** Used for the create account text in sign in component */
  @Prop() createAccountText: string = CREATE_ACCOUNT_TEXT;
  /** Used for the no account text in sign in component */
  @Prop() noAccountText: string = NO_ACCOUNT_TEXT;
  /** (Optional) Overrides default styling */
  @Prop() overrideStyle: boolean = false;

  render() {
    return (
      <amplify-form-section headerText={this.headerText} overrideStyle={this.overrideStyle} handleSubmit={this.handleSubmit}>
        <amplify-username-field fieldIdText={this.fieldIdText} />
        <amplify-password-field fieldIdText={this.fieldIdText} />
        <AmplifyForgotPasswordLink forgotPasswordText={this.forgotPasswordText} resetPasswordText={this.resetPasswordText} />
        <div slot="amplify-form-section-footer">
          <SignInFormFooter submitButtonText={this.submitButtonText} createAccountText={this.createAccountText} noAccountText={this.noAccountText} />
        </div>
      </amplify-form-section>
    );
  }
}
