import { Component, Prop, State, h } from '@stencil/core';
import { FormFieldTypes } from '../amplify-auth-fields/amplify-auth-fields-interface';
import { AuthState, ChallengeName, CognitoUserInterface } from '../../common/types/auth-types';
import { CHANGE_PASSWORD, CHANGE, BACK_TO_SIGN_IN, NO_AUTH_MODULE_FOUND } from '../../common/constants';
// import { CodeDeliveryType } from './amplify-forgot-password-interface';

import { Auth } from '@aws-amplify/auth';
import { Logger, isEmpty } from '@aws-amplify/core';

const logger = new Logger('amplify-require-new-password');

@Component({
  tag: 'amplify-require-new-password',
  shadow: false,
})
export class AmplifyRequireNewPassword {
  /** The header text of the forgot password section */
  @Prop() headerText: string = CHANGE_PASSWORD;
  /** The text displayed inside of the submit button for the form */
  @Prop() submitButtonText: string = CHANGE;
  /** The form fields displayed inside of the forgot password form */
  @Prop() formFields: FormFieldTypes;
  /** (Optional) Overrides default styling */
  @Prop() overrideStyle: boolean = false;
  /** The function called when submitting a new password */
  @Prop() handleSubmit: (event: Event) => void = event => this.change(event);
  /** Passed from the Authenticatior component in order to change Authentication state */
  @Prop() handleAuthStateChange: (nextAuthState: AuthState, data?: object) => void;

  /** Used for the username to be passed to resend code */
  @Prop() user: CognitoUserInterface;

  @State() username: string;
  @State() password: string;
  @State() code: string;

  componentWillLoad() {
    this.formFields = [
      {
        type: 'password',
        required: true,
        handleInputChange: event => this.handlePasswordChange(event),
        label: 'New password',
        placeholder: 'Enter your new password',
        value: this.password,
      },
    ];
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

  async change(event) {
    if (event) {
      event.preventDefault();
    }

    if (!Auth || typeof Auth.completeNewPassword !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }

    try {
      const attrs = null;
      const user = await Auth.completeNewPassword(this.user, this.password, attrs);
      logger.debug('complete new password', user);
      if (user.challengeName === ChallengeName.SMSMFA) {
        this.handleAuthStateChange(AuthState.ConfirmSignIn, user);
      } else if (user.challengeName === ChallengeName.MFASetup) {
        logger.debug('TOTP setup', user.challengeParam);
        this.handleAuthStateChange(AuthState.TOTPSetup, user);
      } else {
        this.checkContact(user);
      }
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
        secondaryFooterContent={
          <amplify-link onClick={() => this.handleAuthStateChange(AuthState.SignIn)}>{BACK_TO_SIGN_IN}</amplify-link>
        }
      >
        <amplify-auth-fields formFields={this.formFields} />
      </amplify-form-section>
    );
  }
}
