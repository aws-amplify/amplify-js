import { Component, Prop, h } from '@stencil/core';
import { Logger } from '@aws-amplify/core';
// import { Auth } from '@aws-amplify/auth';
import { CognitoUserInterface, MFATOTPOptions } from '../../common/types/auth-types';

const logger = new Logger('TOTP');

@Component({
  tag: 'amplify-totp',
  shadow: false,
})
export class AmplifyTOTP {
  /** Types of MFA options */
  @Prop() MFATypes: MFATOTPOptions;
  /** Current authenticated user in order to sign requests properly for TOTP */
  @Prop() authData: CognitoUserInterface = null;

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
            // Add handleInputChange
          />
        ) : null}
        {TOTP ? (
          <amplify-radio-button
            key="totp"
            name="MFAType"
            value="TOTP"
            label="TOTP"
            // Add handleInputChange
          />
        ) : null}
        {Optional ? (
          <amplify-radio-button
            key="noMFA"
            name="MFAType"
            value="NOMFA"
            label="No MFA"
            // Add handleInputChange
          />
        ) : null}
      </amplify-form-section>
    );
  }

  render() {
    return <div>{this.contentBuilder()}</div>;
  }
}
