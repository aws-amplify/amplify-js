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
   *    type: string,
   *    label: string,
   *    placeholder: string,
   *    hint: string | Functional Component | null,
   *    required: boolean
   *  }
   * ]
   * ```
   */
  @Prop() formFields: FormFieldTypes | string[] = [];
  /** Auth state change handler for this component
   * e.g. SignIn -> 'Create Account' link -> SignUp
   */
  @Prop() handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;
  /** Username Alias is used to setup authentication with `username`, `email` or `phone_number`  */
  @Prop() usernameAlias: UsernameAliasStrings = 'username';
  // private userInput: string | PhoneNumberInterface;
  private newFormFields: FormFieldTypes | string[] = [];
  private phoneNumber: PhoneNumberInterface = {
    countryDialCodeValue: COUNTRY_DIAL_CODE_DEFAULT,
    phoneNumberValue: null,
  };

  @State() loading: boolean = false;
  @State() signUpAttributes: AmplifySignUpAttributes = {
    username: '',
    password: '',
    attributes: {},
  };

  handleFormFieldInputChange(fieldType) {
    switch (fieldType) {
      case 'username':
        return event => (this.signUpAttributes.username = event.target.value);
      case 'password':
        return event => (this.signUpAttributes.password = event.target.value);
      case 'email':
        return event => (this.signUpAttributes.attributes.email = event.target.value);
      case 'phone_number':
        return event => this.handlePhoneNumberChange(event);
      default:
        return event => (this.signUpAttributes.attributes[fieldType] = event.target.value);
    }
  }

  handleFormFieldInputWithCallback(event, field) {
    const fnToCall = field['handleInputChange'];
    const callback =
      field.type === 'phone_number'
        ? event => (this.signUpAttributes.attributes.phone_number = event.target.value)
        : this.handleFormFieldInputChange(field.type);
    fnToCall(event, callback.bind(this));
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
    if (this.phoneNumber.phoneNumberValue) {
      this.signUpAttributes.attributes.phone_number = composePhoneNumberInput(this.phoneNumber);
    }
    switch (this.usernameAlias) {
      case 'email':
      case 'phone_number':
        this.signUpAttributes.username = this.signUpAttributes.attributes[this.usernameAlias];
        break;
      case 'username':
      default:
        break;
    }

    try {
      const data = await Auth.signUp(this.signUpAttributes);
      this.handleAuthStateChange(AuthState.ConfirmSignUp, { ...data.user, signUpAttrs: this.signUpAttributes });
    } catch (error) {
      dispatchToastHubEvent(error);
    }
  }

  async componentWillLoad() {
    checkUsernameAlias(this.usernameAlias);
    if (this.formFields.length === 0) {
      switch (this.usernameAlias) {
        case 'email':
          this.newFormFields = [
            {
              type: 'email',
              placeholder: I18n.get(Translations.SIGN_UP_EMAIL_PLACEHOLDER),
              required: true,
              handleInputChange: this.handleFormFieldInputChange('email'),
              inputProps: {
                'data-test': 'sign-up-email-input',
              },
            },
            {
              type: 'password',
              placeholder: I18n.get(Translations.SIGN_UP_PASSWORD_PLACEHOLDER),
              required: true,
              handleInputChange: this.handleFormFieldInputChange('password'),
              inputProps: {
                'data-test': 'sign-up-password-input',
              },
            },
            {
              type: 'phone_number',
              required: true,
              handleInputChange: this.handleFormFieldInputChange('phone_number'),
              inputProps: {
                'data-test': 'sign-up-phone-number-input',
              },
            },
          ];
          break;
        case 'phone_number':
          this.newFormFields = [
            {
              type: 'phone_number',
              required: true,
              handleInputChange: this.handleFormFieldInputChange('phone_number'),
              inputProps: {
                'data-test': 'sign-up-phone-number-input',
              },
            },
            {
              type: 'password',
              placeholder: I18n.get(Translations.SIGN_UP_PASSWORD_PLACEHOLDER),
              required: true,
              handleInputChange: this.handleFormFieldInputChange('password'),
              inputProps: {
                'data-test': 'sign-up-password-input',
              },
            },
            {
              type: 'email',
              placeholder: I18n.get(Translations.SIGN_UP_EMAIL_PLACEHOLDER),
              required: true,
              handleInputChange: this.handleFormFieldInputChange('email'),
              inputProps: {
                'data-test': 'sign-up-email-input',
              },
            },
          ];
          break;
        case 'username':
        default:
          this.newFormFields = [
            {
              type: 'username',
              placeholder: I18n.get(Translations.SIGN_UP_USERNAME_PLACEHOLDER),
              required: true,
              handleInputChange: this.handleFormFieldInputChange('username'),
              inputProps: {
                'data-test': 'sign-up-username-input',
              },
            },
            {
              type: 'password',
              placeholder: I18n.get(Translations.SIGN_UP_PASSWORD_PLACEHOLDER),
              required: true,
              handleInputChange: this.handleFormFieldInputChange('password'),
              inputProps: {
                'data-test': 'sign-up-password-input',
              },
            },
            {
              type: 'email',
              placeholder: I18n.get(Translations.SIGN_UP_EMAIL_PLACEHOLDER),
              required: true,
              handleInputChange: this.handleFormFieldInputChange('email'),
              inputProps: {
                'data-test': 'sign-up-email-input',
              },
            },
            {
              type: 'phone_number',
              required: true,
              handleInputChange: this.handleFormFieldInputChange('phone_number'),
              inputProps: {
                'data-test': 'sign-up-phone-number-input',
              },
            },
          ];
          break;
      }
    } else {
      this.formFields.forEach(field => {
        const newField = { ...field };
        newField['handleInputChange'] = event => this.handleFormFieldInputWithCallback(event, field);
        this.newFormFields.push(newField);
      });
    }
  }

  render() {
    return (
      <amplify-form-section headerText={this.headerText} handleSubmit={this.handleSubmit} testDataPrefix={'sign-up'}>
        <amplify-auth-fields formFields={this.newFormFields} />
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
