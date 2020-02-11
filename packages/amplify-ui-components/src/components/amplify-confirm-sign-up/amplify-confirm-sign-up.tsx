import { Component, Prop, h, State } from '@stencil/core';
import { FormFieldTypes } from '../amplify-auth-fields/amplify-auth-fields-interface';
import {
  CONFIRM_SIGN_UP_HEADER_TEXT,
  CONFIRM_SIGN_UP_SUBMIT_BUTTON_TEXT,
  BACK_TO_SIGN_IN,
  USERNAME_PLACEHOLDER,
  CONFIRM_SIGN_UP_CODE_LABEL,
  CONFIRM_SIGN_UP_CODE_PLACEHOLDER,
  CONFIRM_SIGN_UP_LOST_CODE,
  CONFIRM_SIGN_UP_RESEND_CODE,
  NO_AUTH_MODULE_FOUND,
} from '../../common/constants';
import { AuthState, CognitoUserInterface, AuthStateHandler } from '../../common/types/auth-types';

import { Auth } from '@aws-amplify/auth';
import { dispatchToastHubEvent } from '../../common/helpers';

@Component({
  tag: 'amplify-confirm-sign-up',
  shadow: false,
})
export class AmplifyConfirmSignUp {
  /** Fires when sign up form is submitted */
  @Prop() handleSubmit: (submitEvent: Event) => void = () => this.confirmSignUp();
  /** Engages when invalid actions occur, such as missing field, etc. */
  @Prop() validationErrors: string;
  /** Used for header text in confirm sign up component */
  @Prop() headerText: string = CONFIRM_SIGN_UP_HEADER_TEXT;
  /** Used for the submit button text in confirm sign up component */
  @Prop() submitButtonText: string = CONFIRM_SIGN_UP_SUBMIT_BUTTON_TEXT;
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
  @Prop() formFields: FormFieldTypes | string[];
  /** Passed from the Authenticator component in order to change Authentication states
   * e.g. SignIn -> 'Create Account' link -> SignUp
   */
  @Prop() handleAuthStateChange: AuthStateHandler;
  /** Used for the username to be passed to resend code */
  @Prop() user: CognitoUserInterface;

  @State() username: string = this.user ? this.user.username : null;
  @State() code: string;

  componentWillLoad() {
    this.formFields = [
      {
        type: 'username',
        placeholder: USERNAME_PLACEHOLDER,
        required: true,
        handleInputChange: event => this.handleUsernameChange(event),
        value: this.user ? this.user.username : null,
        // TODO: Add class style adjustment
        disabled: this.user && this.user.username ? true : false,
      },
      {
        type: 'code',
        label: CONFIRM_SIGN_UP_CODE_LABEL,
        placeholder: CONFIRM_SIGN_UP_CODE_PLACEHOLDER,
        required: true,
        hint: (
          <div>
            {CONFIRM_SIGN_UP_LOST_CODE}{' '}
            <amplify-link onClick={() => this.resendConfirmCode()}>{CONFIRM_SIGN_UP_RESEND_CODE}</amplify-link>
          </div>
        ),
        handleInputChange: event => this.handleCodeChange(event),
      },
    ];
  }

  handleUsernameChange(event) {
    this.username = event.target.value;
  }

  handleCodeChange(event) {
    this.code = event.target.value;
  }

  async resendConfirmCode() {
    if (event) {
      event.preventDefault();
    }
    if (!Auth || typeof Auth.resendSignUp !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }
    try {
      if (!this.username) throw new Error('Username can not be empty');
      await Auth.resendSignUp(this.username);
      this.handleAuthStateChange(AuthState.ConfirmSignUp);
    } catch (error) {
      dispatchToastHubEvent(error);
    }
  }

  // TODO: Add validation
  // TODO: Prefix
  async confirmSignUp() {
    if (event) {
      event.preventDefault();
    }
    if (!Auth || typeof Auth.confirmSignUp !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }

    try {
      const user = await Auth.confirmSignUp(this.username, this.code);

      this.handleAuthStateChange(AuthState.SignedIn, user);
    } catch (error) {
      dispatchToastHubEvent(error);
    }
  }

  render() {
    return (
      <amplify-form-section
        headerText={this.headerText}
        overrideStyle={this.overrideStyle}
        submitButtonText={this.submitButtonText}
        handleSubmit={this.handleSubmit}
        secondaryFooterContent={
          <div>
            <span>
              <amplify-link onClick={() => this.handleAuthStateChange(AuthState.SignIn)}>
                {BACK_TO_SIGN_IN}
              </amplify-link>
            </span>
          </div>
        }
      >
        <amplify-auth-fields formFields={this.formFields} />
      </amplify-form-section>
    );
  }
}
