import { Component, Prop, State, h } from '@stencil/core';
import { FormFieldTypes } from '../../components/amplify-auth-fields/amplify-auth-fields-interface';
import { AuthState } from '../../common/types/auth-types';

import { BACK_TO_SIGN_IN, CONFIRM } from '../../common/constants';

import { Logger } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';

const logger = new Logger('ConfirmSignIn');

@Component({
  tag: 'amplify-confirm-sign-in',
  shadow: false,
})
export class AmplifyConfirmSignIn {
  /** Fires when confirm sign in form is submitted */
  @Prop() handleSubmit: (Event) => void = event => this.confirm(event);
  /** Engages when invalid actions occur, such as missing field, etc. */
  @Prop() validationErrors: string;

  @Prop() mfaType: string = 'SMS';
  /** Used for header text in confirm sign in component */
  @Prop() headerText: string = `Confirm ${this.mfaType} Code`;
  /** Used for the submit button text in confirm sign in component */
  @Prop() submitButtonText: string = CONFIRM;
  /** (Optional) Overrides default styling */
  @Prop() overrideStyle: boolean = false;
  /** Passed from the Authenticatior component in order to change Authentication state */
  @Prop() handleAuthStateChange: (nextAuthState: AuthState, data?: object) => void;
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

  @Prop() user: object;

  /* Whether or not the confirm-sign-in component is loading */
  @State() loading: boolean = false;
  /* The code value in the confirm-sign-in form */
  @State() code: string;

  componentWillLoad() {
    this.formFields = [
      {
        type: 'code',
        required: true,
        handleInputChange: event => this.handleCodeChange(event),
      },
    ];
  }

  handleCodeChange(event) {
    this.code = event.target.value;
    console.log(this.code);
  }

  checkContact(user) {
    if (!Auth || typeof Auth.verifiedContact !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }
    Auth.verifiedContact(user).then(data => {
      if (Object.keys(data.verified).length === 0) {
        this.handleAuthStateChange(AuthState.SignedIn, user);
      } else {
        user = Object.assign(user, data);
        this.handleAuthStateChange(AuthState.VerifyContact, user);
      }
    });
  }

  async confirm(event) {
    if (event) {
      event.preventDefault();
    }
    const mfaType = this.user['challengeName'] === 'SOFTWARE_TOKEN_MFA' ? 'SOFTWARE_TOKEN_MFA' : null;
    if (!Auth || typeof Auth.confirmSignIn !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    try {
      await Auth.confirmSignIn(this.user, this.code, mfaType);
      this.checkContact(this.user);
    } catch (error) {
      logger.error(error);
      throw new Error(error);
    }
  }

  render() {
    return (
      <amplify-form-section
        headerText={this.headerText}
        overrideStyle={this.overrideStyle}
        handleSubmit={this.handleSubmit}
        submitButtonText={this.submitButtonText}
        secondaryFooterContent={
          <span>
            <amplify-link onClick={() => this.handleAuthStateChange(AuthState.SignIn)}>{BACK_TO_SIGN_IN}</amplify-link>
          </span>
        }
      >
        <amplify-auth-fields formFields={this.formFields} />
      </amplify-form-section>
    );
  }
}
