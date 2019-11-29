import { Component, Prop, State, h } from '@stencil/core';
import { Logger } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';
import { CognitoUserInterface, MFATOTPOptions } from '../../common/types/auth-types';

const logger = new Logger('TOTP');

export interface radioInputValueTypes {
  SMS: boolean | string;
  TOTP: boolean | string;
  NOMFA: boolean | string;
}

@Component({
  tag: 'amplify-totp',
  shadow: false,
})
export class AmplifyTOTP {
  /** Types of MFA options */
  @Prop() MFATypes: MFATOTPOptions;
  /** Current authenticated user in order to sign requests properly for TOTP */
  @Prop() authData: CognitoUserInterface = null;
  /** Fires when Verify is clicked */
  @Prop() handleSubmit: (Event) => void = event => this.verify(event);

  @State() radioInputValues: radioInputValueTypes;
  @State() TOTPSetup: boolean = false;
  @State() selectMessage: string = null;
  @State() mfaMethod: any = null;

  handleRadioChange(event) {
    this.TOTPSetup = false;
    this.selectMessage = null;

    const { value } = event.target;

    this.radioInputValues[value] = value;
  }

  verify(event) {
    if (event) {
      event.preventDefault();
    }

    logger.debug('mfatypes inputs', this.radioInputValues);

    if (!this.radioInputValues) {
      logger.debug('No mfa type selected');
      return;
    }

    const { TOTP, SMS, NOMFA } = this.radioInputValues;

    if (TOTP) {
      this.mfaMethod = 'TOTP';
    } else if (SMS) {
      this.mfaMethod = 'SMS';
    } else if (NOMFA) {
      this.mfaMethod = 'NOMFA';
    }

    const user = this.authData;

    if (!Auth || typeof Auth.setPreferredMFA !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    Auth.setPreferredMFA(user, this.mfaMethod)
      .then(data => {
        logger.debug('set preferred mfa success', data);
        this.selectMessage = `Success! Your MFA Type is now: ${this.mfaMethod}`;
        // 	TODO Add Toast = showToast: true,
      })
      .catch(error => {
        const { message } = error;
        if (
          message === 'User has not set up software token mfa' ||
          message === 'User has not verified software token mfa'
        ) {
          this.TOTPSetup = true;
          this.selectMessage = 'You need to setup TOTP';
          // 	TODO Add Toast = showToast: true,
        } else {
          logger.debug('set preferred mfa failed', error);
          this.selectMessage = 'Failed! You cannot select MFA Type for now!';
          // 	TODO Add Toast = showToast: true,
        }
      });
  }

  contentBuilder() {
    if (!this.MFATypes || Object.keys(this.MFATypes).length < 2) {
      logger.debug('less than 2 mfa types available');
      return (
        <div>
          <a>less than 2 mfa types available</a>
        </div>
      );
    }

    const { SMS, TOTP, Optional } = this.MFATypes;

    return (
      // TODO: Add Toast messages
      <amplify-form-section submitButtonText="Verify" headerText="Select MFA Type">
        {SMS ? (
          <amplify-radio-button
            key="sms"
            name="MFAType"
            value="SMS"
            label="SMS"
            handleInputChange={this.handleRadioChange}
          />
        ) : null}
        {TOTP ? (
          <amplify-radio-button
            key="totp"
            name="MFAType"
            value="TOTP"
            label="TOTP"
            handleInputChange={this.handleRadioChange}
          />
        ) : null}
        {Optional ? (
          <amplify-radio-button
            key="noMFA"
            name="MFAType"
            value="NOMFA"
            label="No MFA"
            handleInputChange={this.handleRadioChange}
          />
        ) : null}
      </amplify-form-section>
    );
  }

  render() {
    return <div>{this.contentBuilder()}</div>;
  }
}
