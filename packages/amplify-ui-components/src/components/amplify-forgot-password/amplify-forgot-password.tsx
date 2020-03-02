import { Auth } from '@aws-amplify/auth';
import { I18n, Logger } from '@aws-amplify/core';
import { Component, Prop, State, h } from '@stencil/core';

import { FormFieldTypes } from '../amplify-auth-fields/amplify-auth-fields-interface';
import { AuthState, AuthStateHandler } from '../../common/types/auth-types';
import { NO_AUTH_MODULE_FOUND } from '../../common/constants';
import { Translations } from '../../common/Translations';
import { CodeDeliveryType } from './amplify-forgot-password-interface';

import { dispatchToastHubEvent, dispatchAuthStateChangeEvent } from '../../common/helpers';

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

  @State() username: string;
  @State() password: string;
  @State() code: string;
  @State() delivery: CodeDeliveryType | null = null;
  @State() loading: boolean = false;

  componentWillLoad() {
    this.formFields = [
      {
        type: 'username',
        required: true,
        handleInputChange: event => this.handleUsernameChange(event),
        value: this.username,
        inputProps: {
          'data-test': 'username-input',
        },
      },
    ];
  }

  handleUsernameChange(event) {
    this.username = event.target.value;
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
    try {
      const data = await Auth.forgotPassword(this.username);
      logger.debug(data);
      this.formFields = [
        {
          type: 'code',
          required: true,
          handleInputChange: event => this.handleCodeChange(event),
          value: this.code,
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
          <amplify-link
            onClick={() => this.handleAuthStateChange(AuthState.SignIn)}
            data-test="forgot-password-back-to-sign-in-link"
          >
            {I18n.get(Translations.BACK_TO_SIGN_IN)}
          </amplify-link>
        }
        testDataPrefix={'forgot-password'}
      >
        <amplify-auth-fields formFields={this.formFields} />
      </amplify-form-section>
    );
  }
}
