import { Component, Prop, State, h } from '@stencil/core';
import { FormFieldTypes } from '../amplify-auth-fields/amplify-auth-fields-interface';
import { AuthState } from '../../common/types/auth-types';
import { BACK_TO_SIGN_IN } from '../../common/constants';

import { Auth } from '@aws-amplify/auth';
import { Logger } from '@aws-amplify/core';

const logger = new Logger('ForgotPassword');

@Component({
  tag: 'amplify-forgot-password',
  shadow: false,
})
export class AmplifyForgotPassword {
  @Prop() headerText: string = 'Reset your password';
  @Prop() submitButtonText: string = 'Send Code';
  @Prop() overrideStyle: boolean = false;
  @Prop() formFields: FormFieldTypes;
  @Prop() handleSend: (event: Event) => void = event => this.send(event);
  @Prop() handleSubmit: (event: Event) => void = event => this.submit(event);
  @Prop() handleAuthStateChange: (nextAuthState: AuthState, data?: object) => void;

  @State() username: string;
  @State() password: string;
  @State() code: string;
  @State() delivery: 'SMS' | 'EMAIL' | null = null;

  componentWillLoad() {
    this.formFields = [
      {
        type: 'username',
        required: true,
        handleInputChange: event => this.handleUsernameChange(event),
        value: this.username,
      },
    ];
  }

  handleUsernameChange(event) {
    this.username = event.target.value;
    console.log(this.username);
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
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
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
      console.log(this.username);
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
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
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
          <amplify-link onClick={() => this.handleAuthStateChange(AuthState.SignIn)}>{BACK_TO_SIGN_IN}</amplify-link>
        }
      >
        <amplify-auth-fields formFields={this.formFields} />
      </amplify-form-section>
    );
  }
}
