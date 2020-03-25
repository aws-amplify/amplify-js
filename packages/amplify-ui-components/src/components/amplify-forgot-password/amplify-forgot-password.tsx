import { Auth } from '@aws-amplify/auth';
import { I18n, Logger } from '@aws-amplify/core';
import { Component, Prop, State, h } from '@stencil/core';

import { FormFieldTypes, PhoneNumberInterface } from '../amplify-auth-fields/amplify-auth-fields-interface';
import { AuthState, AuthStateHandler, UsernameAliasStrings } from '../../common/types/auth-types';
import {
  NO_AUTH_MODULE_FOUND,
  COUNTRY_DIAL_CODE_DEFAULT,
  PHONE_SUFFIX,
  COUNTRY_DIAL_CODE_SUFFIX,
} from '../../common/constants';
import { Translations } from '../../common/Translations';
import { CodeDeliveryType } from './amplify-forgot-password-interface';

import {
  dispatchToastHubEvent,
  dispatchAuthStateChangeEvent,
  composePhoneNumberInput,
  checkUsernameAlias,
} from '../../common/helpers';

const logger = new Logger('ForgotPassword');

@Component({
  tag: 'amplify-forgot-password',
  shadow: true,
})
export class AmplifyForgotPassword {
  /** The header text of the forgot password section */
  @Prop() headerText: string = I18n.get(Translations.RESET_YOUR_PASSWORD);
  /** The text displayed inside of the submit button for the form */
  @Prop() submitButtonText: string = I18n.get(Translations.SEND_CODE);
  /** The form fields displayed inside of the forgot password form */
  @Prop() formFields: FormFieldTypes;
  /** The function called when making a request to reset password */
  @Prop() handleSend: (event: Event) => void = event => this.send(event);
  /** The function called when submitting a new password */
  @Prop() handleSubmit: (event: Event) => void = event => this.submit(event);
  /** Passed from the Authenticator component in order to change Authentication state */
  @Prop() handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;
  /** Username Alias is used to setup authentication with `username`, `email` or `phone_number`  */
  @Prop() usernameAlias: UsernameAliasStrings = 'username';

  @State() username: string;
  @State() password: string;
  @State() code: string;
  @State() delivery: CodeDeliveryType | null = null;
  @State() loading: boolean = false;
  @State() email: string;
  @State() phoneNumber: PhoneNumberInterface = {
    countryDialCodeValue: COUNTRY_DIAL_CODE_DEFAULT,
    phoneNumberValue: null,
  };

  componentWillLoad() {
    checkUsernameAlias(this.usernameAlias);
    switch (this.usernameAlias) {
      case 'email':
        this.formFields = [
          {
            type: 'email',
            required: true,
            handleInputChange: event => this.handleEmailChange(event),
            inputProps: {
              'data-test': 'forgot-password-email-input',
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
              'data-test': 'forgot-password-phone-number-input',
            },
          },
        ];
        break;
      case 'username':
      default:
        this.formFields = [
          {
            type: 'username',
            required: true,
            handleInputChange: event => this.handleUsernameChange(event),
            value: this.username,
            inputProps: {
              'data-test': 'forgot-password-username-input',
            },
          },
        ];
        break;
    }
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

  handlePasswordChange(event) {
    this.password = event.target.value;
  }

  handleCodeChange(event) {
    this.code = event.target.value;
  }

  async send(event) {
    if (event) {
      event.preventDefault();
    }
    if (!Auth || typeof Auth.forgotPassword !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }
    this.loading = true;

    switch (this.usernameAlias) {
      case 'email':
        this.username = this.email;
        break;
      case 'phone_number':
        this.username = composePhoneNumberInput(this.phoneNumber);
        break;
      case 'username':
      default:
        break;
    }

    try {
      const data = await Auth.forgotPassword(this.username);
      logger.debug(data);
      this.formFields = [
        {
          type: 'code',
          required: true,
          handleInputChange: event => this.handleCodeChange(event),
          value: this.code,
          inputProps: {
            'data-test': 'forgot-password-code-input',
          },
        },
        {
          type: 'password',
          required: true,
          handleInputChange: event => this.handlePasswordChange(event),
          label: 'New password',
          placeholder: 'Enter your new password',
          value: this.password,
        },
      ];
      this.delivery = data.CodeDeliveryDetails;
    } catch (error) {
      dispatchToastHubEvent(error);
    } finally {
      this.loading = false;
    }
  }

  async submit(event: Event) {
    if (event) {
      event.preventDefault();
    }
    if (!Auth || typeof Auth.forgotPasswordSubmit !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }
    this.loading = true;
    try {
      const data = await Auth.forgotPasswordSubmit(this.username, this.code, this.password);
      logger.debug(data);
      this.handleAuthStateChange(AuthState.SignIn);
      this.delivery = null;
    } catch (error) {
      dispatchToastHubEvent(error);
    } finally {
      this.loading = false;
    }
  }

  render() {
    const submitFn = this.delivery ? event => this.handleSubmit(event) : event => this.handleSend(event);
    return (
      <amplify-form-section
        headerText={this.headerText}
        handleSubmit={submitFn}
        loading={this.loading}
        secondaryFooterContent={
          <amplify-button
            variant="anchor"
            onClick={() => this.handleAuthStateChange(AuthState.SignIn)}
            data-test="forgot-password-back-to-sign-in-link"
          >
            {I18n.get(Translations.BACK_TO_SIGN_IN)}
          </amplify-button>
        }
        testDataPrefix={'forgot-password'}
      >
        <amplify-auth-fields formFields={this.formFields} />
      </amplify-form-section>
    );
  }
}
