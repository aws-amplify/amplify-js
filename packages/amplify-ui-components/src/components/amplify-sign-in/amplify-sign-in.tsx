import { Component, Prop, State, h } from '@stencil/core';
import { FormFieldTypes } from '../../components/amplify-auth-fields/amplify-auth-fields-interface';
// import { AmplifyForgotPasswordHint } from './amplify-forgot-password-hint';
import { AuthState } from '../../common/types/auth-types';

import {
  HEADER_TEXT,
  SUBMIT_BUTTON_TEXT,
  CREATE_ACCOUNT_TEXT,
  NO_ACCOUNT_TEXT,
  FORGOT_PASSWORD_TEXT,
  RESET_PASSWORD_TEXT,
} from '../../common/constants';

import { Logger } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';

const logger = new Logger('SignIn');

@Component({
  tag: 'amplify-sign-in',
  shadow: false,
})
export class AmplifySignIn {
  /** Fires when sign in form is submitted */
  @Prop() handleSubmit: (Event) => void = event => this.signIn(event);
  /** Engages when invalid actions occur, such as missing field, etc. */
  @Prop() validationErrors: string;
  /** Used for header text in sign in component */
  @Prop() headerText: string = HEADER_TEXT;
  /** Used for the submit button text in sign in component */
  @Prop() submitButtonText: string = SUBMIT_BUTTON_TEXT;
  /** (Optional) Overrides default styling */
  @Prop() overrideStyle: boolean = false;

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

  /* Whether or not the sign-in component is loading */
  @State() loading: boolean = false;
  /* The username value in the sign-in form */
  @State() username: string;
  /* The password value in the sign-in form */
  @State() password: string;

  componentWillLoad() {
    this.formFields = [
      {
        type: 'username',
        required: true,
        handleInputChange: event => this.handleUsernameChange(event),
      },
      {
        type: 'password',
        hint: (
          <div>
            {FORGOT_PASSWORD_TEXT}{' '}
            <amplify-link onClick={() => this.handleAuthStateChange(AuthState.ForgotPassword)}>
              {RESET_PASSWORD_TEXT}
            </amplify-link>
          </div>
        ),
        required: true,
        handleInputChange: event => this.handlePasswordChange(event),
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

  async signIn(event) {
    console.log(event);
    // avoid submitting the form
    if (event) {
      event.preventDefault();
    }

    if (!Auth || typeof Auth.signIn !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }
    this.loading = true;
    try {
      const user = await Auth.signIn(this.username, this.password);
      logger.debug(user);
      if (user.challengeName === 'SMS_MFA' || user.challengeName === 'SOFTWARE_TOKEN_MFA') {
        logger.debug('confirm user with ' + user.challengeName);
        this.handleAuthStateChange(AuthState.ConfirmSignIn, user);
      } else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
        logger.debug('require new password', user.challengeParam);
        this.handleAuthStateChange(AuthState.ResetPassword, user);
      } else if (user.challengeName === 'MFA_SETUP') {
        logger.debug('TOTP setup', user.challengeParam);
        this.handleAuthStateChange(AuthState.TOTPSetup, user);
      } else if (
        user.challengeName === 'CUSTOM_CHALLENGE' &&
        user.challengeParam &&
        user.challengeParam.trigger === 'true'
      ) {
        logger.debug('custom challenge', user.challengeParam);
        this.handleAuthStateChange(AuthState.CustomConfirmSignIn, user);
      } else {
        this.checkContact(user);
      }
    } catch (error) {
      if (error.code === 'UserNotConfirmedException') {
        logger.debug('the user is not confirmed');
        this.handleAuthStateChange(AuthState.ConfirmSignUp, { username: this.username });
      } else if (error.code === 'PasswordResetRequiredException') {
        logger.debug('the user requires a new password');
        this.handleAuthStateChange(AuthState.ForgotPassword, { username: this.username });
      } else {
        throw new Error(error);
      }
    } finally {
      this.loading = false;
    }
  }

  render() {
    return (
      <amplify-form-section
        headerText={this.headerText}
        overrideStyle={this.overrideStyle}
        handleSubmit={this.handleSubmit}
        secondaryFooterContent={
          <span>
            {NO_ACCOUNT_TEXT}{' '}
            <amplify-link onClick={() => this.handleAuthStateChange(AuthState.SignUp)}>
              {CREATE_ACCOUNT_TEXT}
            </amplify-link>
          </span>
        }
      >
        <amplify-auth-fields formFields={this.formFields} />
      </amplify-form-section>
    );
  }
}
