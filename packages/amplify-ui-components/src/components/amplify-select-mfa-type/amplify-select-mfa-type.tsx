import { Component, Prop, State, h } from '@stencil/core';
import { Logger } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';
import { CognitoUserInterface, MFATypesInterface, MfaOption } from '../../common/types/auth-types';
import {
  NO_AUTH_MODULE_FOUND,
  SET_PREFERRED_MFA_FAILURE,
  SET_PREFERRED_MFA_SUCCESS,
  USER_NOT_SETUP_SOFTWARE_TOKEN_MFA,
  USER_NOT_VERIFIED_SOFTWARE_TOKEN_MFA,
  SETUP_TOTP_REQUIRED,
  UNABLE_TO_SETUP_MFA_AT_THIS_TIME,
  SUCCESS_MFA_TYPE,
  LESS_THAN_TWO_MFA_VALUES_MESSAGE,
  SELECT_MFA_TYPE_SUBMIT_BUTTON_TEXT,
  SELECT_MFA_TYPE_HEADER_TEXT,
  MFA_TYPE_VALUES,
} from '../../common/constants';

const logger = new Logger('SelectMFAType');

@Component({
  tag: 'amplify-select-mfa-type',
  shadow: true,
})
export class AmplifySelectMFAType {
  /** Types of MFA options */
  @Prop() MFATypes: MFATypesInterface;
  /** Current authenticated user in order to sign requests properly for TOTP */
  @Prop() authData: CognitoUserInterface;
  /** Fires when Verify is clicked */
  @Prop() handleSubmit: (submitEvent: Event) => void = submitEvent => this.verify(submitEvent);

  @State() TOTPSetup: boolean = false;
  @State() selectMessage: string = null;
  @State() MFAMethod: MfaOption = null;

  @State() isTOTP: boolean = false;
  @State() isNoMFA: boolean = false;
  @State() isSMS: boolean = false;

  handleRadioButtonChange(event) {
    this.TOTPSetup = false;
    this.selectMessage = null;

    // Reseting state values to default
    this.isNoMFA = false;
    this.isTOTP = false;
    this.isSMS = false;

    const { value, type, checked } = event.target;
    const checkType = ['radio', 'checkbox'].includes(type);

    if (value === MfaOption.SMS && checkType) {
      this.isSMS = checked;
    }

    if (value === MfaOption.TOTP && checkType) {
      this.isTOTP = checked;
    }

    if (value === MfaOption.NOMFA && checkType) {
      this.isNoMFA = checked;
    }
  }

  async verify(event: Event) {
    // avoid submitting the form
    if (event) {
      event.preventDefault();
    }

    logger.debug(MFA_TYPE_VALUES, { TOTP: this.isTOTP, SMS: this.isSMS, 'No MFA': this.isNoMFA });

    if (this.isTOTP) {
      this.MFAMethod = MfaOption.TOTP;
    } else if (this.isSMS) {
      this.MFAMethod = MfaOption.SMS;
    } else if (this.isNoMFA) {
      this.MFAMethod = MfaOption.NOMFA;
    }

    const user = this.authData;

    if (!Auth || typeof Auth.setPreferredMFA !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }

    try {
      const preferredMFAData = await Auth.setPreferredMFA(user, this.MFAMethod);

      logger.debug(SET_PREFERRED_MFA_SUCCESS, preferredMFAData);
      this.selectMessage = `${SUCCESS_MFA_TYPE} ${this.MFAMethod}`;
      // 	TODO Add Toast = showToast: true,
    } catch (error) {
      const { message } = error;

      if (message === USER_NOT_SETUP_SOFTWARE_TOKEN_MFA || message === USER_NOT_VERIFIED_SOFTWARE_TOKEN_MFA) {
        this.TOTPSetup = true;
        this.selectMessage = SETUP_TOTP_REQUIRED;
        // 	TODO Add Toast = showToast: true,
      } else {
        logger.debug(SET_PREFERRED_MFA_FAILURE, error);
        this.selectMessage = UNABLE_TO_SETUP_MFA_AT_THIS_TIME;
        // 	TODO Add Toast = showToast: true,
      }
    }
  }

  contentBuilder() {
    if (!this.MFATypes || Object.keys(this.MFATypes).length < 2) {
      logger.debug(LESS_THAN_TWO_MFA_VALUES_MESSAGE);
      return (
        <div>
          <a>{LESS_THAN_TWO_MFA_VALUES_MESSAGE}</a>
        </div>
      );
    }

    const { SMS, TOTP, Optional } = this.MFATypes;

    return (
      // TODO: Add Toast messages
      <amplify-form-section
        submitButtonText={SELECT_MFA_TYPE_SUBMIT_BUTTON_TEXT}
        headerText={SELECT_MFA_TYPE_HEADER_TEXT}
        handleSubmit={event => this.handleSubmit(event)}
      >
        {SMS ? (
          <amplify-radio-button
            key="sms"
            name="MFAType"
            value="SMS"
            label="SMS"
            handleInputChange={event => this.handleRadioButtonChange(event)}
          />
        ) : null}
        {TOTP ? (
          <amplify-radio-button
            key="totp"
            name="MFAType"
            value="TOTP"
            label="TOTP"
            handleInputChange={event => this.handleRadioButtonChange(event)}
          />
        ) : null}
        {Optional ? (
          <amplify-radio-button
            key="noMFA"
            name="MFAType"
            value="NOMFA"
            label="No MFA"
            handleInputChange={event => this.handleRadioButtonChange(event)}
          />
        ) : null}
      </amplify-form-section>
    );
  }
  render() {
    return (
      <div>
        {this.contentBuilder()}
        {this.TOTPSetup ? <amplify-totp-setup user={this.authData} /> : null}
      </div>
    );
  }
}
