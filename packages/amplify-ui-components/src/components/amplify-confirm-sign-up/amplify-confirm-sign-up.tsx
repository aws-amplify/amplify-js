import { Component, Prop, h, State } from '@stencil/core';
import { FormFieldTypes } from '../amplify-auth-fields/amplify-auth-fields-interface';
import {
  CONFIRM_SIGN_UP_HEADER_TEXT,
  CONFIRM_SIGN_UP_SUBMIT_BUTTON_TEXT,
  CONFIRM_SIGN_IN_TEXT,
} from '../../common/constants';
import { AmplifyConfirmSignUpFormFooter } from './amplify-confirm-sign-up-form-footer';
import { AuthStateTunnel } from '../../data/auth-state';
import { AuthState } from '../../common/types/auth-types';

import { Auth } from '@aws-amplify/auth';

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
  /** Used for `Back to Sign In` text passed to footer component */
  @Prop() signInText: string = CONFIRM_SIGN_IN_TEXT;
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

  @Prop() handleAuthStateChange: (nextAuthState: AuthState, data?: object) => void;

  @State() username: string;
  @State() code: string;

  componentWillLoad() {
    this.formFields = [
      {
        type: 'username',
        placeholder: 'Enter your username',
        required: true,
        handleInputChange: event => this.handleUsernameChange(event),
      },
      {
        type: 'code',
        label: 'Confirmation Code',
        placeholder: 'Enter your code',
        required: true,
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

  // TODO: Add validation
  // TODO: Prefix
  async confirmSignUp() {
    if (event) {
      event.preventDefault();
    }
    if (!Auth || typeof Auth.signUp !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    try {
      const user = await Auth.confirmSignUp(this.username, this.code);

      this.handleAuthStateChange(AuthState.SignedIn, user);
    } catch (error) {
      throw new Error(error);
    }
  }

  render() {
    return (
      <AuthStateTunnel.Consumer>
        {({ onAuthStateChange }) => (
          <amplify-form-section
            headerText={this.headerText}
            overrideStyle={this.overrideStyle}
            handleSubmit={this.handleSubmit}
          >
            <amplify-auth-fields formFields={this.formFields} />
            <div slot="amplify-form-section-footer">
              <AmplifyConfirmSignUpFormFooter
                submitButtonText={this.submitButtonText}
                signInText={this.signInText}
                onAuthStateChange={onAuthStateChange}
              />
            </div>
          </amplify-form-section>
        )}
      </AuthStateTunnel.Consumer>
    );
  }
}
