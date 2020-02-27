import { I18n } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';
import { Component, Prop, h, State } from '@stencil/core';
import { FormFieldTypes } from '../../components/amplify-auth-fields/amplify-auth-fields-interface';
import {
  PHONE_SUFFIX,
  COUNTRY_DIAL_CODE_DEFAULT,
  COUNTRY_DIAL_CODE_SUFFIX,
  PHONE_EMPTY_ERROR_MESSAGE,
  NO_AUTH_MODULE_FOUND,
} from '../../common/constants';
import { AuthState, AuthStateHandler } from '../../common/types/auth-types';
import { AmplifySignUpAttributes, PhoneNumberInterface } from './amplify-sign-up-interface';
import { dispatchAuthStateChangeEvent, dispatchToastHubEvent } from '../../common/helpers';
import { Translations } from '../../common/Translations';

@Component({
  tag: 'amplify-sign-up',
  styleUrl: 'amplify-sign-up.scss',
  shadow: true,
})
export class AmplifySignUp {
  /** Fires when sign up form is submitted */
  @Prop() handleSubmit: (event: Event) => void = event => this.signUp(event);
  /** Engages when invalid actions occur, such as missing field, etc. */
  @Prop() validationErrors: string;
  /** Used for header text in sign up component */
  @Prop() headerText: string = I18n.get(Translations.SIGN_UP_HEADER_TEXT);
  /** Used for the submit button text in sign up component */
  @Prop() submitButtonText: string = I18n.get(Translations.SIGN_UP_SUBMIT_BUTTON_TEXT);
  /** Used for the submit button text in sign up component */
  @Prop() haveAccountText: string = I18n.get(Translations.SIGN_UP_HAVE_ACCOUNT_TEXT);
  /** Used for the submit button text in sign up component */
  @Prop() signInText: string = I18n.get(Translations.SIGN_IN_TEXT);
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
  @Prop() formFields: FormFieldTypes | string[] = [
    {
      type: 'username',
      placeholder: I18n.get(Translations.SIGN_UP_USERNAME_PLACEHOLDER),
      required: true,
      handleInputChange: event => this.handleUsernameChange(event),
    },
    {
      type: 'password',
      placeholder: I18n.get(Translations.SIGN_UP_PASSWORD_PLACEHOLDER),
      required: true,
      handleInputChange: event => this.handlePasswordChange(event),
    },
    {
      type: 'email',
      placeholder: I18n.get(Translations.SIGN_UP_EMAIL_PLACEHOLDER),
      required: true,
      handleInputChange: event => this.handleEmailChange(event),
    },
    {
      type: 'phone',
      required: true,
      handleInputChange: event => this.handlePhoneNumberChange(event),
      inputProps: {
        'data-test': 'phone-number-input',
      },
    },
  ];
  /** Passed from the Authenticator component in order to change Authentication state
   * e.g. SignIn -> 'Create Account' link -> SignUp
   */
  @Prop() handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;

  @State() loading: boolean = false;
  @State() username: string;
  @State() password: string;
  @State() email: string;

  @State() phoneNumber: PhoneNumberInterface = {
    countryDialCodeValue: COUNTRY_DIAL_CODE_DEFAULT,
    phoneNumberValue: null,
  };

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

  composePhoneNumberInput(phoneNumber: PhoneNumberInterface) {
    if (!phoneNumber.phoneNumberValue) {
      throw new Error(PHONE_EMPTY_ERROR_MESSAGE);
    }

    const sanitizedPhoneNumberValue = phoneNumber.phoneNumberValue.replace(/[-()\s]/g, '');

    return `${phoneNumber.countryDialCodeValue}${sanitizedPhoneNumberValue}`;
  }

  // TODO: Add validation
  // TODO: Prefix
  async signUp(event: Event) {
    if (event) {
      event.preventDefault();
    }
    if (!Auth || typeof Auth.signUp !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }

    try {
      const signUpAttrs: AmplifySignUpAttributes = {
        username: this.username,
        password: this.password,
        attributes: {
          email: this.email,
          phone_number: this.composePhoneNumberInput(this.phoneNumber),
        },
      };

      const data = await Auth.signUp(signUpAttrs);
      this.handleAuthStateChange(AuthState.ConfirmSignUp, data.user);
    } catch (error) {
      dispatchToastHubEvent(error);
    }
  }

  render() {
    return (
      <amplify-form-section headerText={this.headerText} handleSubmit={this.handleSubmit} testDataPrefix={'sign-up'}>
        <amplify-auth-fields formFields={this.formFields} />
        <div class="sign-up-form-footer" slot="amplify-form-section-footer">
          <span>
            {this.haveAccountText}{' '}
            <amplify-link onClick={() => this.handleAuthStateChange(AuthState.SignIn)} data-test="sign-up-sign-in-link">
              {this.signInText}
            </amplify-link>
          </span>
          <amplify-button type="submit" data-test="sign-up-create-account-button">
            <amplify-loading-spinner style={{ display: this.loading ? 'initial' : 'none' }} />
            <span style={{ display: this.loading ? 'none' : 'initial' }}>{this.submitButtonText}</span>
          </amplify-button>
        </div>
      </amplify-form-section>
    );
  }
}
