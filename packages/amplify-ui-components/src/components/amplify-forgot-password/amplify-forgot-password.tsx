import { Component, Prop, State, h } from '@stencil/core';
import { FormFieldTypes } from '../amplify-auth-fields/amplify-auth-fields-interface';
import { AuthState, AuthStateHandler } from '../../common/types/auth-types';
import { RESET_YOUR_PASSWORD, SEND_CODE, BACK_TO_SIGN_IN, NO_AUTH_MODULE_FOUND } from '../../common/constants';
import { CodeDeliveryType } from './amplify-forgot-password-interface';

import { Auth } from '@aws-amplify/auth';
import { Logger } from '@aws-amplify/core';

const logger = new Logger('ForgotPassword');

@Component({
  tag: 'amplify-forgot-password',
  shadow: false,
})
export class AmplifyForgotPassword {
  /** The header text of the forgot password section */
  @Prop() headerText: string = RESET_YOUR_PASSWORD;
  /** The text displayed inside of the submit button for the form */
  @Prop() submitButtonText: string = SEND_CODE;
  /** The form fields displayed inside of the forgot password form */
  @Prop() formFields: FormFieldTypes;
  /** (Optional) Overrides default styling */
  @Prop() overrideStyle: boolean = false;
  /** The function called when making a request to reset password */
  @Prop() handleSend: (event: Event) => void = event => this.send(event);
  /** The function called when submitting a new password */
  @Prop() handleSubmit: (event: Event) => void = event => this.submit(event);
  /** Passed from the Authenticator component in order to change Authentication state */
  @Prop() handleAuthStateChange: AuthStateHandler;

  @State() username: string;
  @State() password: string;
  @State() code: string;
  @State() delivery: CodeDeliveryType | null = null;

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
      logger.error(error);
      throw new Error(error);
    }
  }

  async submit(event) {
    if (event) {
      event.preventDefault();
    }
    if (!Auth || typeof Auth.forgotPasswordSubmit !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }
    try {
      const data = await Auth.forgotPasswordSubmit(this.username, this.code, this.password);
      logger.debug(data);
      this.handleAuthStateChange(AuthState.SignIn);
      this.delivery = null;
    } catch (error) {
      logger.error(error);
      throw new Error(error);
    }
  }

  render() {
    const submitFn = this.delivery ? event => this.handleSubmit(event) : event => this.handleSend(event);
    return (
      <amplify-form-section
        headerText={this.headerText}
        overrideStyle={this.overrideStyle}
        handleSubmit={submitFn}
        secondaryFooterContent={
          <amplify-link
            onClick={() => this.handleAuthStateChange(AuthState.SignIn)}
            data-test="forgot-password-back-to-sign-in-link"
          >
            {BACK_TO_SIGN_IN}
          </amplify-link>
        }
        testDataPrefix={'forgot-password'}
      >
        <amplify-auth-fields formFields={this.formFields} />
      </amplify-form-section>
    );
  }
}
