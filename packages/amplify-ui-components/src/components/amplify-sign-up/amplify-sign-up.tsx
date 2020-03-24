import { I18n } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';
import { Component, Prop, h, State } from '@stencil/core';
import {
  FormFieldTypes,
  PhoneNumberInterface,
} from '../../components/amplify-auth-fields/amplify-auth-fields-interface';
import {
  PHONE_SUFFIX,
  COUNTRY_DIAL_CODE_DEFAULT,
  COUNTRY_DIAL_CODE_SUFFIX,
  NO_AUTH_MODULE_FOUND,
} from '../../common/constants';
import { AuthState, AuthStateHandler, UsernameAliasStrings } from '../../common/types/auth-types';
import { AmplifySignUpAttributes } from './amplify-sign-up-interface';
import {
  dispatchAuthStateChangeEvent,
  dispatchToastHubEvent,
  composePhoneNumberInput,
  checkUsernameAlias,
} from '../../common/helpers';
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
  @Prop() formFields: FormFieldTypes | string[] = [];
  /** Passed from the Authenticator component in order to change Authentication state
   * e.g. SignIn -> 'Create Account' link -> SignUp
   */
  @Prop() handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;
  /** Username Alias is used to setup authentication with `username`, `email` or `phone_number`  */
  @Prop() usernameAlias: UsernameAliasStrings = 'username';
  private userInput: string | PhoneNumberInterface;

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

  // TODO: Add validation
  // TODO: Prefix
  async signUp(event: Event) {
    if (event) {
      event.preventDefault();
    }
    if (!Auth || typeof Auth.signUp !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }

    switch (this.usernameAlias) {
      case 'email':
        this.userInput = this.email;
        break;
      case 'phone_number':
        this.userInput = composePhoneNumberInput(this.phoneNumber);
        break;
      case 'username':
      default:
        this.userInput = this.username;
        break;
    }

    try {
      const signUpAttrs: AmplifySignUpAttributes = {
        username: this.userInput,
        password: this.password,
        attributes: {
          email: this.email,
          phone_number: composePhoneNumberInput(this.phoneNumber),
        },
      };

      const data = await Auth.signUp(signUpAttrs);
      this.handleAuthStateChange(AuthState.ConfirmSignUp, data.user);
    } catch (error) {
      dispatchToastHubEvent(error);
    }
  }

  async componentWillLoad() {
    checkUsernameAlias(this.usernameAlias);
    switch (this.usernameAlias) {
      case 'email':
        this.formFields = [
          {
            type: 'email',
            placeholder: I18n.get(Translations.SIGN_UP_EMAIL_PLACEHOLDER),
            required: true,
            handleInputChange: event => this.handleEmailChange(event),
            inputProps: {
              'data-test': 'sign-up-email-input',
            },
          },
          {
            type: 'password',
            placeholder: I18n.get(Translations.SIGN_UP_PASSWORD_PLACEHOLDER),
            required: true,
            handleInputChange: event => this.handlePasswordChange(event),
            inputProps: {
              'data-test': 'sign-up-password-input',
            },
          },
          {
            type: 'phone_number',
            required: true,
            handleInputChange: event => this.handlePhoneNumberChange(event),
            inputProps: {
              'data-test': 'sign-up-phone-number-input',
            },
          },
        ];
        break;
      case 'phone_number':
        this.formFields = [
          {
            type: 'phone_number',
            required: true,
            handleInputChange: event => this.handlePhoneNumberChange(event),
            inputProps: {
              'data-test': 'sign-up-phone-number-input',
            },
          },
          {
            type: 'password',
            placeholder: I18n.get(Translations.SIGN_UP_PASSWORD_PLACEHOLDER),
            required: true,
            handleInputChange: event => this.handlePasswordChange(event),
            inputProps: {
              'data-test': 'sign-up-password-input',
            },
          },
          {
            type: 'email',
            placeholder: I18n.get(Translations.SIGN_UP_EMAIL_PLACEHOLDER),
            required: true,
            handleInputChange: event => this.handleEmailChange(event),
            inputProps: {
              'data-test': 'sign-up-email-input',
            },
          },
        ];
        break;
      case 'username':
      default:
        this.formFields = [
          {
            type: 'username',
            placeholder: I18n.get(Translations.SIGN_UP_USERNAME_PLACEHOLDER),
            required: true,
            handleInputChange: event => this.handleUsernameChange(event),
            inputProps: {
              'data-test': 'sign-up-username-input',
            },
          },
          {
            type: 'password',
            placeholder: I18n.get(Translations.SIGN_UP_PASSWORD_PLACEHOLDER),
            required: true,
            handleInputChange: event => this.handlePasswordChange(event),
            inputProps: {
              'data-test': 'sign-up-password-input',
            },
          },
          {
            type: 'email',
            placeholder: I18n.get(Translations.SIGN_UP_EMAIL_PLACEHOLDER),
            required: true,
            handleInputChange: event => this.handleEmailChange(event),
            inputProps: {
              'data-test': 'sign-up-email-input',
            },
          },
          {
            type: 'phone_number',
            required: true,
            handleInputChange: event => this.handlePhoneNumberChange(event),
            inputProps: {
              'data-test': 'sign-up-phone-number-input',
            },
          },
        ];
        break;
    }
  }

  render() {
    return (
      <amplify-form-section headerText={this.headerText} handleSubmit={this.handleSubmit} testDataPrefix={'sign-up'}>
        <amplify-auth-fields formFields={this.formFields} />
        <div class="sign-up-form-footer" slot="amplify-form-section-footer">
          <span>
            {this.haveAccountText}{' '}
            <amplify-button
              variant="anchor"
              onClick={() => this.handleAuthStateChange(AuthState.SignIn)}
              data-test="sign-up-sign-in-link"
            >
              {this.signInText}
            </amplify-button>
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
