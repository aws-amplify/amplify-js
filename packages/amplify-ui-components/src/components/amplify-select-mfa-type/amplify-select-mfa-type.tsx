import { Component, Prop, State, h } from '@stencil/core';
import { Logger } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';
import { CognitoUserInterface, MFATOTPOptions } from '../../common/types/auth-types';

const logger = new Logger('SelectMFAType');

@Component({
  tag: 'amplify-select-mfa-type',
  shadow: false,
})
export class AmplifySelectMFAType {
  /** Types of MFA options */
  @Prop() MFATypes: MFATOTPOptions;
  /** Current authenticated user in order to sign requests properly for TOTP */
  @Prop() authData: CognitoUserInterface = null;
  /** Fires when Verify is clicked */
  @Prop() handleSubmit: (submitEvent: Event) => void = () => this.verify();

  @State() TOTPSetup: boolean = false;
  @State() selectMessage: string = null;
  @State() mfaMethod: any = null;

  @State() isTotp: boolean = false;
  @State() isNoMfa: boolean = false;
  @State() isSMS: boolean = false;

  handleRadioChange(event) {
    this.TOTPSetup = false;
    this.selectMessage = null;

    // Reseting state values to default
    this.isNoMfa = false;
    this.isTotp = false;
    this.isSMS = false;

    const { value, type, checked } = event.target;
    const checkType = ['radio', 'checkbox'].includes(type);

    if (value === 'SMS' && checkType) {
      this.isSMS = checked;
    }

    if (value === 'TOTP' && checkType) {
      this.isTotp = checked;
    }

    if (value === 'NOMFA' && checkType) {
      this.isNoMfa = checked;
    }
  }

  verify() {
    // avoid submitting the form
    if (event) {
      event.preventDefault();
    }

    logger.debug('MFA Types values', { TOTP: this.isTotp, SMS: this.isSMS, 'No MFA': this.isNoMfa });

    if (this.isTotp) {
      this.mfaMethod = 'TOTP';
    } else if (this.isSMS) {
      this.mfaMethod = 'SMS';
    } else if (this.isNoMfa) {
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
      <amplify-form-section submitButtonText="Verify" headerText="Select MFA Type" handleSubmit={this.handleSubmit}>
        {SMS ? (
          <amplify-radio-button
            key="sms"
            name="MFAType"
            value="SMS"
            label="SMS"
            handleInputChange={event => this.handleRadioChange(event)}
          />
        ) : null}
        {TOTP ? (
          <amplify-radio-button
            key="totp"
            name="MFAType"
            value="TOTP"
            label="TOTP"
            handleInputChange={event => this.handleRadioChange(event)}
          />
        ) : null}
        {Optional ? (
          <amplify-radio-button
            key="noMFA"
            name="MFAType"
            value="NOMFA"
            label="No MFA"
            handleInputChange={event => this.handleRadioChange(event)}
          />
        ) : null}
      </amplify-form-section>
    );
  }

  render() {
    return <div>{this.contentBuilder()}</div>;
  }
}
