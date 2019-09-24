import { Component, FunctionalComponent as FC, Prop, h } from '@stencil/core';
import { AmplifyForgotPasswordHintProps, SignInFormFooterProps } from './amplify-sign-in-interface';
import { FormFieldTypes } from '../../components/amplify-auth-fields/amplify-auth-fields-interface';
import { signInFormFooter } from './amplify-sign-in.styles';
import {
  HEADER_TEXT,
  SUBMIT_BUTTON_TEXT,
  CREATE_ACCOUNT_TEXT,
  NO_ACCOUNT_TEXT,
  FORGOT_PASSWORD_TEXT,
  RESET_PASSWORD_TEXT
} from '../../common/constants';


export const AmplifyForgotPasswordHint: FC<AmplifyForgotPasswordHintProps> = ({ forgotPasswordText, resetPasswordText }) => (
  <div>
    {forgotPasswordText} <amplify-link>{resetPasswordText}</amplify-link>
  </div>
);

const SignInFormFooter: FC<SignInFormFooterProps> = ({ submitButtonText, noAccountText, createAccountText, overrideStyle = false }) => (
  <div class={signInFormFooter}>
    <span>{noAccountText} <amplify-link>{createAccountText}</amplify-link></span>
    <amplify-button type="submit" overrideStyle={overrideStyle}>{submitButtonText}</amplify-button>
  </div>
);

const SIGN_IN_COMPONENTS = [
  {
    type: 'username',
    required: true,
  },
  {
    type: 'password',
    hint: <AmplifyForgotPasswordHint forgotPasswordText={FORGOT_PASSWORD_TEXT} resetPasswordText={RESET_PASSWORD_TEXT} />,
    required: true,
  },
];

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
  /** Used for the submit button text in sign in component */
  @Prop() submitButtonText: string = SUBMIT_BUTTON_TEXT;
  /** (Optional) Overrides default styling */
  @Prop() overrideStyle: boolean = false;
  /** 
   * Form fields allows you to utilize our pre-built components such as username field, code field, password field, email field, etc.
   * by passing an array of strings that you would like the order of the form to be in. If you need more customization, such as changing
   * text for a label or adjust a placeholder, you can follow the structure below in order to do just that.
   * ```
   * [
   *  {
   *    type: 'username'|'password'|'email'|'code'|'default',
   *    label: string,
   *    placeholder: string,
   *    hint: string | Functional Component | null,
   *    required: boolean
   *  }
   * ]
   * ```
  */
  @Prop() formFields: FormFieldTypes | string[] = SIGN_IN_COMPONENTS; 

  render() {
    return (
      <amplify-form-section headerText={this.headerText} overrideStyle={this.overrideStyle} handleSubmit={this.handleSubmit}>
        <amplify-auth-fields formFields={this.formFields} />
        <div slot="amplify-form-section-footer">
          <SignInFormFooter submitButtonText={this.submitButtonText} createAccountText={CREATE_ACCOUNT_TEXT} noAccountText={NO_ACCOUNT_TEXT} />
        </div>
      </amplify-form-section>
    );
  }
}
