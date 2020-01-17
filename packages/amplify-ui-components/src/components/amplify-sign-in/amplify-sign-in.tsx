import { Component, Prop, State, h } from '@stencil/core';
import { FormFieldTypes } from '../../components/amplify-auth-fields/amplify-auth-fields-interface';
import { AuthState, ChallengeName, FederatedConfig, AuthStateHandler } from '../../common/types/auth-types';
import { formSectionFooter } from '../amplify-form-section/amplify-form-section.style';

import {
  HEADER_TEXT,
  SIGN_IN_SUBMIT_BUTTON_TEXT,
  CREATE_ACCOUNT_TEXT,
  NO_ACCOUNT_TEXT,
  NO_AUTH_MODULE_FOUND,
  FORGOT_PASSWORD_TEXT,
  RESET_PASSWORD_TEXT,
} from '../../common/constants';

import { Logger, isEmpty } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';

const logger = new Logger('SignIn');

@Component({
  tag: 'amplify-sign-in',
  shadow: false,
})
export class AmplifySignIn {
  /** Fires when sign in form is submitted */
  @Prop() handleSubmit: (Event: Event) => void = event => this.signIn(event);
  /** Engages when invalid actions occur, such as missing field, etc. */
  @Prop() validationErrors: string;
  /** Used for header text in sign in component */
  @Prop() headerText: string = HEADER_TEXT;
  /** Used for the submit button text in sign in component */
  @Prop() submitButtonText: string = SIGN_IN_SUBMIT_BUTTON_TEXT;
  /** (Optional) Overrides default styling */
  @Prop() overrideStyle: boolean = false;
  /** Federated credentials & configuration. */
  @Prop() federated: FederatedConfig;
  /** Passed from the Authenticator component in order to change Authentication state */
  @Prop() handleAuthStateChange: AuthStateHandler;
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
      required: true,
      handleInputChange: event => this.handleUsernameChange(event),
      inputProps: {
        'data-test': 'username-input',
      },
    },
    {
      type: 'password',
      hint: (
        <div>
          {FORGOT_PASSWORD_TEXT}{' '}
          <amplify-link
            onClick={() => this.handleAuthStateChange(AuthState.ForgotPassword)}
            data-test="sign-in-forgot-password-link"
          >
            {RESET_PASSWORD_TEXT}
          </amplify-link>
        </div>
      ),
      required: true,
      handleInputChange: event => this.handlePasswordChange(event),
      inputProps: {
        'data-test': 'sign-in-password-input',
      },
    },
  ];

  /* Whether or not the sign-in component is loading */
  @State() loading: boolean = false;
  /* The username value in the sign-in form */
  @State() username: string;
  /* The password value in the sign-in form */
  @State() password: string;

  handleUsernameChange(event) {
    this.username = event.target.value;
  }

  handlePasswordChange(event) {
    this.password = event.target.value;
  }

  checkContact(user) {
    if (!Auth || typeof Auth.verifiedContact !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }
    Auth.verifiedContact(user).then(data => {
      if (!isEmpty(data.verified)) {
        this.handleAuthStateChange(AuthState.SignedIn, user);
      } else {
        user = Object.assign(user, data);
        this.handleAuthStateChange(AuthState.VerifyContact, user);
      }
    });
  }

  async signIn(event) {
    // avoid submitting the form
    if (event) {
      event.preventDefault();
    }

    if (!Auth || typeof Auth.signIn !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }
    this.loading = true;
    try {
      const user = await Auth.signIn(this.username, this.password);
      logger.debug(user);
      if (user.challengeName === ChallengeName.SMSMFA || user.challengeName === ChallengeName.SoftwareTokenMFA) {
        logger.debug('confirm user with ' + user.challengeName);
        this.handleAuthStateChange(AuthState.ConfirmSignIn, user);
      } else if (user.challengeName === ChallengeName.NewPasswordRequired) {
        logger.debug('require new password', user.challengeParam);
        this.handleAuthStateChange(AuthState.ResetPassword, user);
      } else if (user.challengeName === ChallengeName.MFASetup) {
        logger.debug('TOTP setup', user.challengeParam);
        this.handleAuthStateChange(AuthState.TOTPSetup, user);
      } else if (
        user.challengeName === ChallengeName.CustomChallenge &&
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
        testDataPrefix={'sign-in'}
      >
        <amplify-federated-buttons
          handleAuthStateChange={this.handleAuthStateChange}
          federated={this.federated}
          overrideStyle={this.overrideStyle}
        />

        {!isEmpty(this.federated) && <amplify-strike overrideStyle={this.overrideStyle}>or</amplify-strike>}

        <amplify-auth-fields formFields={this.formFields} />
        <div slot="amplify-form-section-footer">
          <div class={formSectionFooter}>
            <amplify-button type="submit" overrideStyle={this.overrideStyle} data-test="sign-in-sign-in-button">
              {this.submitButtonText}
            </amplify-button>
            <span>
              {NO_ACCOUNT_TEXT}{' '}
              <amplify-link
                onClick={() => this.handleAuthStateChange(AuthState.SignUp)}
                data-test="sign-in-create-account-link"
              >
                {CREATE_ACCOUNT_TEXT}
              </amplify-link>
            </span>
          </div>
        </div>
      </amplify-form-section>
    );
  }
}
