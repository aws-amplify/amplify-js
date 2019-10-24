import { Component, Prop, h, State } from '@stencil/core';
import { FormFieldTypes } from '../../components/amplify-auth-fields/amplify-auth-fields-interface';
import {
  SIGN_UP_HEADER_TEXT,
  SIGN_UP_SUBMIT_BUTTON_TEXT,
  HAVE_ACCOUNT_TEXT,
  SIGN_IN_TEXT,
  SIGN_UP_USERNAME_PLACEHOLDER,
  SIGN_UP_PASSWORD_PLACEHOLDER,
  SIGN_UP_PHONE_NUMBER_LABEL,
  SIGN_UP_PHONE_NUMBER_PLACEHOLDER,
} from '../../common/constants';
import { AmplifySignUpFormFooter } from './amplify-sign-up-form-footer';
import { AuthState } from '../../common/types/auth-types';
import { AmplifySignUpAttributes } from './amplify-sign-up-interface';

import { Auth } from '@aws-amplify/auth';

@Component({
  tag: 'amplify-sign-up',
  shadow: false,
})
export class AmplifySignUp {
  /** Fires when sign up form is submitted */
  @Prop() handleSubmit: (submitEvent: Event) => void = () => this.signUp();
  /** Engages when invalid actions occur, such as missing field, etc. */
  @Prop() validationErrors: string;
  /** Used for header text in sign up component */
  @Prop() headerText: string = SIGN_UP_HEADER_TEXT;
  /** Used for the submit button text in sign up component */
  @Prop() submitButtonText: string = SIGN_UP_SUBMIT_BUTTON_TEXT;
  /** Used for the submit button text in sign up component */
  @Prop() haveAccountText: string = HAVE_ACCOUNT_TEXT;
  /** Used for the submit button text in sign up component */
  @Prop() signInText: string = SIGN_IN_TEXT;
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
  /** Passed from the Authenticatior component in order to change Authentication state
   * e.g. SignIn -> 'Create Account' link -> SignUp
   */
  @Prop() handleAuthStateChange: (nextAuthState: AuthState, data?: object) => void;

  @State() username: string;
  @State() password: string;
  @State() email: string;
  @State() phone_number: string;

  componentWillLoad() {
    this.formFields = [
      {
        type: 'username',
        placeholder: SIGN_UP_USERNAME_PLACEHOLDER,
        required: true,
        handleInputChange: event => this.handleUsernameChange(event),
      },
      {
        type: 'password',
        placeholder: SIGN_UP_PASSWORD_PLACEHOLDER,
        required: true,
        handleInputChange: event => this.handlePasswordChange(event),
      },
      {
        type: 'email',
        required: true,
        handleInputChange: event => this.handleEmailChange(event),
      },
      {
        type: 'phone',
        label: SIGN_UP_PHONE_NUMBER_LABEL,
        placeholder: SIGN_UP_PHONE_NUMBER_PLACEHOLDER,
        required: true,
        handleInputChange: event => this.handlePhoneNumberChange(event),
      },
    ];
  }

  handleUsernameChange(event) {
    this.username = event.target.value;
  }

  handlePasswordChange(event) {
    this.password = event.target.value;
  }

  handleEmailChange(event) {
    this.email = event.target.value;
  }

  handlePhoneNumberChange(event) {
    this.phone_number = event.target.value;
  }

  // TODO: Add validation
  // TODO: Prefix
  async signUp() {
    if (event) {
      event.preventDefault();
    }
    if (!Auth || typeof Auth.signUp !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    const signUpAttrs: AmplifySignUpAttributes = {
      username: this.username,
      password: this.password,
      attributes: {
        email: this.email,
        phone_number: this.phone_number,
      },
    };

    try {
      const data = await Auth.signUp(signUpAttrs);

      this.handleAuthStateChange(AuthState.ConfirmSignUp, data);
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    return (
      <amplify-form-section
        headerText={this.headerText}
        overrideStyle={this.overrideStyle}
        handleSubmit={this.handleSubmit}
      >
        <amplify-auth-fields formFields={this.formFields} />
        <div slot="amplify-form-section-footer">
          <AmplifySignUpFormFooter
            submitButtonText={this.submitButtonText}
            haveAcccountText={this.haveAccountText}
            signInText={this.signInText}
            handleAuthStateChange={this.handleAuthStateChange}
          />
        </div>
      </amplify-form-section>
    );
  }
}
