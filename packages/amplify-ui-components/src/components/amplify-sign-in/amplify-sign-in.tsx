import { Auth } from '@aws-amplify/auth';
import { I18n, Logger, isEmpty } from '@aws-amplify/core';
import { Component, Prop, State, h, Watch } from '@stencil/core';
import {
  FormFieldTypes,
  PhoneNumberInterface,
} from '../../components/amplify-auth-fields/amplify-auth-fields-interface';
import {
  AuthState,
  ChallengeName,
  FederatedConfig,
  AuthStateHandler,
  UsernameAliasStrings,
} from '../../common/types/auth-types';
import { Translations } from '../../common/Translations';
import {
  NO_AUTH_MODULE_FOUND,
  COUNTRY_DIAL_CODE_DEFAULT,
  COUNTRY_DIAL_CODE_SUFFIX,
  PHONE_SUFFIX,
} from '../../common/constants';

import {
  dispatchToastHubEvent,
  dispatchAuthStateChangeEvent,
  composePhoneNumberInput,
  checkUsernameAlias,
  isHintValid,
} from '../../common/helpers';
import { SignInAttributes } from './amplify-sign-in-interface';

const logger = new Logger('SignIn');
/**
 * @slot footer - Content is place in the footer of the component
 * @slot primary-footer-content - Content placed on the right side of the footer
 * @slot secondary-footer-content - Content placed on the left side of the footer
 */
@Component({
  tag: 'amplify-sign-in',
  styleUrl: 'amplify-sign-in.scss',
  shadow: true,
})
export class AmplifySignIn {
  /** Fires when sign in form is submitted */
  @Prop() handleSubmit: (event: Event) => void = event => this.signIn(event);
  /** Used for header text in sign in component */
  @Prop() headerText: string = I18n.get(Translations.SIGN_IN_HEADER_TEXT);
  /** Used for the submit button text in sign in component */
  @Prop() submitButtonText: string = I18n.get(Translations.SIGN_IN_ACTION);
  /** Federated credentials & configuration. */
  @Prop() federated: FederatedConfig;
  /** Auth state change handler for this component */
  @Prop() handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;
  /** Username Alias is used to setup authentication with `username`, `email` or `phone_number`  */
  @Prop() usernameAlias: UsernameAliasStrings = 'username';
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
  /** Hides the sign up link */
  @Prop() hideSignUp: boolean = false;
  private newFormFields: FormFieldTypes | string[] = [];

  /* Whether or not the sign-in component is loading */
  @State() loading: boolean = false;

  private phoneNumber: PhoneNumberInterface = {
    countryDialCodeValue: COUNTRY_DIAL_CODE_DEFAULT,
    phoneNumberValue: null,
  };

  @State() signInAttributes: SignInAttributes = {
    userInput: '',
    password: '',
  };

  private handleFormFieldInputChange(fieldType) {
    switch (fieldType) {
      case 'username':
      case 'email':
        return event => (this.signInAttributes.userInput = event.target.value);
      case 'phone_number':
        return event => this.handlePhoneNumberChange(event);
      case 'password':
        return event => (this.signInAttributes.password = event.target.value);
    }
  }

  private handleFormFieldInputWithCallback(event, field) {
    const fnToCall = field['handleInputChange']
      ? field['handleInputChange']
      : (event, cb) => {
          cb(event);
        };
    const callback = this.handleFormFieldInputChange(field.type);
    fnToCall(event, callback.bind(this));
  }

  private handlePhoneNumberChange(event) {
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

  private checkContact(user) {
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

  private async signIn(event: Event) {
    // avoid submitting the form
    if (event) {
      event.preventDefault();
    }

    if (!Auth || typeof Auth.signIn !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }
    this.loading = true;

    switch (this.usernameAlias) {
      case 'phone_number':
        this.signInAttributes.userInput = composePhoneNumberInput(this.phoneNumber);
      default:
        break;
    }

    try {
      const user = await Auth.signIn(this.signInAttributes.userInput, this.signInAttributes.password);
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
      dispatchToastHubEvent(error);
      if (error.code === 'UserNotConfirmedException') {
        logger.debug('the user is not confirmed');
        this.handleAuthStateChange(AuthState.ConfirmSignUp, { username: this.signInAttributes.userInput });
      } else if (error.code === 'PasswordResetRequiredException') {
        logger.debug('the user requires a new password');
        this.handleAuthStateChange(AuthState.ForgotPassword, { username: this.signInAttributes.userInput });
      }
    } finally {
      this.loading = false;
    }
  }

  buildDefaultFormFields() {
    const formFieldInputs = [];
    switch (this.usernameAlias) {
      case 'email':
        formFieldInputs.push({
          type: 'email',
          required: true,
          handleInputChange: this.handleFormFieldInputChange('email'),
          inputProps: {
            'data-test': 'sign-in-email-input',
          },
        });
        break;
      case 'phone_number':
        formFieldInputs.push({
          type: 'phone_number',
          required: true,
          handleInputChange: this.handleFormFieldInputChange('phone_number'),
          inputProps: {
            'data-test': 'sign-in-phone-number-input',
          },
        });
        break;
      case 'username':
      default:
        formFieldInputs.push({
          type: 'username',
          required: true,
          handleInputChange: this.handleFormFieldInputChange('username'),
          inputProps: {
            'data-test': 'sign-in-username-input',
          },
        });
        break;
    }

    formFieldInputs.push({
      type: 'password',
      hint: (
        <div>
          {I18n.get(Translations.FORGOT_PASSWORD_TEXT)}{' '}
          <amplify-button
            variant="anchor"
            onClick={() => this.handleAuthStateChange(AuthState.ForgotPassword)}
            data-test="sign-in-forgot-password-link"
          >
            {I18n.get(Translations.RESET_PASSWORD_TEXT)}
          </amplify-button>
        </div>
      ),
      required: true,
      handleInputChange: this.handleFormFieldInputChange('password'),
      inputProps: {
        'data-test': 'sign-in-password-input',
      },
    });
    this.newFormFields = [...formFieldInputs];
  }

  buildFormFields() {
    if (this.formFields.length === 0) {
      this.buildDefaultFormFields();
    } else {
      const newFields = [];
      this.formFields.forEach(field => {
        const newField = { ...field };
        // TODO: handle hint better
        if (newField.type === 'password') {
          newField['hint'] = isHintValid(newField) ? (
            <div>
              {I18n.get(Translations.FORGOT_PASSWORD_TEXT)}{' '}
              <amplify-button
                variant="anchor"
                onClick={() => this.handleAuthStateChange(AuthState.ForgotPassword)}
                data-test="sign-in-forgot-password-link"
              >
                {I18n.get(Translations.RESET_PASSWORD_TEXT)}
              </amplify-button>
            </div>
          ) : (
            newField['hint']
          );
        }
        newField['handleInputChange'] = event => this.handleFormFieldInputWithCallback(event, field);
        newFields.push(newField);
      });
      this.newFormFields = newFields;
    }
  }

  componentWillLoad() {
    checkUsernameAlias(this.usernameAlias);
    this.buildFormFields();
  }

  @Watch('formFields')
  formFieldsHandler() {
    this.buildFormFields();
  }

  render() {
    return (
      <amplify-form-section headerText={this.headerText} handleSubmit={this.handleSubmit} testDataPrefix={'sign-in'}>
        <amplify-federated-buttons handleAuthStateChange={this.handleAuthStateChange} federated={this.federated} />

        {!isEmpty(this.federated) && <amplify-strike>or</amplify-strike>}

        <amplify-auth-fields formFields={this.newFormFields} />
        <div slot="amplify-form-section-footer" class="sign-in-form-footer">
          <slot name="footer">
            <slot name="secondary-footer-content">
              {!this.hideSignUp ? (
                <span>
                  {I18n.get(Translations.NO_ACCOUNT_TEXT)}{' '}
                  <amplify-button
                    variant="anchor"
                    onClick={() => this.handleAuthStateChange(AuthState.SignUp)}
                    data-test="sign-in-create-account-link"
                  >
                    {I18n.get(Translations.CREATE_ACCOUNT_TEXT)}
                  </amplify-button>
                </span>
              ) : (
                <span></span>
              )}
            </slot>

            <slot name="primary-footer-content">
              <amplify-button type="submit" disabled={this.loading} data-test="sign-in-sign-in-button">
                <amplify-loading-spinner style={{ display: this.loading ? 'initial' : 'none' }} />
                <span style={{ display: this.loading ? 'none' : 'initial' }}>{this.submitButtonText}</span>
              </amplify-button>
            </slot>
          </slot>
        </div>
      </amplify-form-section>
    );
  }
}
