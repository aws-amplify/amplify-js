import { Auth } from '@aws-amplify/auth';
import { I18n, isEmpty } from '@aws-amplify/core';
import { Component, Prop, State, h } from '@stencil/core';
import { FormFieldTypes } from '../../components/amplify-auth-fields/amplify-auth-fields-interface';
import {
  AuthState,
  MfaOption,
  CognitoUserInterface,
  ChallengeName,
  AuthStateHandler,
} from '../../common/types/auth-types';
import { NO_AUTH_MODULE_FOUND } from '../../common/constants';
import { dispatchToastHubEvent, dispatchAuthStateChangeEvent } from '../../common/helpers';
import { Translations } from '../../common/Translations';

@Component({
  tag: 'amplify-confirm-sign-in',
  shadow: true,
})
export class AmplifyConfirmSignIn {
  /** Fires when confirm sign in form is submitted */
  @Prop() handleSubmit: (event: Event) => void = event => this.confirm(event);
  /** Engages when invalid actions occur, such as missing field, etc. */
  @Prop() validationErrors: string;
  /** Used for header text in confirm sign in component */
  @Prop() headerText: string = I18n.get(Translations.CONFIRM_SMS_CODE);
  /** Used for the submit button text in confirm sign in component */
  @Prop() submitButtonText: string = I18n.get(Translations.CONFIRM);
  /** Passed from the Authenticator component in order to change Authentication state */
  @Prop() handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;
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
      type: 'code',
      required: true,
      handleInputChange: event => this.handleCodeChange(event),
    },
  ];
  /** Cognito user signing in */
  @Prop() user: CognitoUserInterface;
  /** The MFA option to confirm with */
  @State() mfaOption: MfaOption = MfaOption.SMS;
  /* Whether or not the confirm-sign-in component is loading */
  @State() loading: boolean = false;
  /* The code value in the confirm-sign-in form */
  @State() code: string;

  componentWillLoad() {
    if (this.user && this.user['challengeName'] === ChallengeName.SoftwareTokenMFA) {
      this.mfaOption = MfaOption.TOTP;
      // If header text is using default use TOTP string
      if (this.headerText === I18n.get(Translations.CONFIRM_SMS_CODE)) {
        this.headerText = I18n.get(Translations.CONFIRM_TOTP_CODE);
      }
    }
  }

  handleCodeChange(event) {
    this.code = event.target.value;
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

  async confirm(event: Event) {
    if (event) {
      event.preventDefault();
    }
    const mfaType =
      this.user['challengeName'] === ChallengeName.SoftwareTokenMFA ? ChallengeName.SoftwareTokenMFA : null;
    if (!Auth || typeof Auth.confirmSignIn !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }

    this.loading = true;
    try {
      await Auth.confirmSignIn(this.user, this.code, mfaType);
      this.checkContact(this.user);
    } catch (error) {
      dispatchToastHubEvent(error);
    } finally {
      this.loading = false;
    }
  }

  render() {
    return (
      <amplify-form-section
        headerText={this.headerText}
        handleSubmit={this.handleSubmit}
        submitButtonText={this.submitButtonText}
        loading={this.loading}
        secondaryFooterContent={
          <span>
            <amplify-button
              variant="anchor"
              onClick={() => this.handleAuthStateChange(AuthState.SignIn)}
            >
              {I18n.get(Translations.BACK_TO_SIGN_IN)}
            </amplify-button>
          </span>
        }
      >
        <amplify-auth-fields formFields={this.formFields} />
      </amplify-form-section>
    );
  }
}
