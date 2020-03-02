import { Component, Prop, h, State } from '@stencil/core';
import { FormFieldTypes, PhoneNumberInterface } from '../amplify-auth-fields/amplify-auth-fields-interface';
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
  PHONE_SUFFIX,
  COUNTRY_DIAL_CODE_SUFFIX,
  COUNTRY_DIAL_CODE_DEFAULT,
} from '../../common/constants';
import { AuthState, CognitoUserInterface, AuthStateHandler, UsernameAttributes } from '../../common/types/auth-types';

import { Auth } from '@aws-amplify/auth';
import { dispatchToastHubEvent, dispatchAuthStateChangeEvent, composePhoneNumberInput } from '../../common/helpers';

@Component({
  tag: 'amplify-confirm-sign-up',
  shadow: true,
})
export class AmplifyConfirmSignUp {
  /** Fires when sign up form is submitted */
  @Prop() handleSubmit: (submitEvent: Event) => void = event => this.confirmSignUp(event);
  /** Engages when invalid actions occur, such as missing field, etc. */
  @Prop() validationErrors: string;
  /** Used for header text in confirm sign up component */
  @Prop() headerText: string = CONFIRM_SIGN_UP_HEADER_TEXT;
  /** Used for the submit button text in confirm sign up component */
  @Prop() submitButtonText: string = CONFIRM_SIGN_UP_SUBMIT_BUTTON_TEXT;
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
  @Prop() handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;
  /** Used for the username to be passed to resend code */
  @Prop() user: CognitoUserInterface;
  @Prop() usernameAttributes: UsernameAttributes = 'username';

  @State() username: string = this.user ? this.user.username : null;
  @State() code: string;
  @State() loading: boolean = false;
  @State() email: string;

  @State() phoneNumber: PhoneNumberInterface = {
    countryDialCodeValue: COUNTRY_DIAL_CODE_DEFAULT,
    phoneNumberValue: null,
  };

  componentWillLoad() {
    const formFieldInputs = [];
    switch (this.usernameAttributes) {
      case 'email':
        formFieldInputs.push({
          type: 'email',
          required: true,
          handleInputChange: event => this.handleEmailChange(event),
        });
        break;
      case 'phone_number':
        formFieldInputs.push({
          type: 'phone',
          required: true,
          handleInputChange: event => this.handlePhoneNumberChange(event),
          inputProps: {
            'data-test': 'phone-number-input',
          },
        });
        break;
      case 'username':
      default:
        formFieldInputs.push({
          type: 'username',
          required: true,
          handleInputChange: event => this.handleUsernameChange(event),
          value: this.user ? this.user.username : null,
          // TODO: Add class style adjustment
          disabled: this.user && this.user.username ? true : false,
        });
        break;
    }

    formFieldInputs.push({
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
    });

    this.formFields = formFieldInputs;
  }

  handleUsernameChange(event) {
    this.username = event.target.value;
  }

  handleEmailChange(event) {
    this.email = event.target.value;
  }

  handlePhoneNumberChange(event) {
    const name = event.target.name;
    const value = event.target.value;

    /** Cognito expects to have a string be passed when signing up. Since the Select input is separate
     * input from the phone number input, we need to first capture both components values and combined
     * them together.
     */

    if (name === COUNTRY_DIAL_CODE_SUFFIX) {
      this.phoneNumber.countryDialCodeValue = value;
    }

    if (name === PHONE_SUFFIX) {
      this.phoneNumber.phoneNumberValue = value;
    }
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
  async confirmSignUp(event: Event) {
    if (event) {
      event.preventDefault();
    }
    if (!Auth || typeof Auth.confirmSignUp !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }

    this.loading = true;

    switch (this.usernameAttributes) {
      case 'email':
        this.username = this.email;
        break;
      case 'phone_number':
        this.username = composePhoneNumberInput(this.phoneNumber);
        break;
      case 'username':
      default:
        this.username = this.username;
        break;
    }

    try {
      const user = await Auth.confirmSignUp(this.username, this.code);

      this.handleAuthStateChange(AuthState.SignedIn, user);
    } catch (error) {
      dispatchToastHubEvent(error);
    } finally {
      this.loading = false;
    }
  }

  render() {
    return (
      <amplify-form-section
        headerText={this.headerText}
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
