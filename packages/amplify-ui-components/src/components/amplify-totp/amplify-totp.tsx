import { Component, Prop, State, h } from '@stencil/core';
import QRCode from 'qrcode';

import { Logger } from '@aws-amplify/core';
import { CognitoUserInterface } from '../../common/types/auth-types';
import { Auth } from '@aws-amplify/auth';
import { totp } from './amplify-totp.style';
import { MfaMethod, TOTPSetupEventType } from './amplify-totp-interface';
import {
  NO_AUTH_MODULE_FOUND,
  TOTP_SETUP_FAILURE,
  NO_TOTP_CODE_PROVIDED,
  TOTP_SUCCESS_MESSAGE,
  TOTP_HEADER_TEXT,
  TOTP_SUBMIT_BUTTON_TEXT,
  SETUP_TOTP,
  SUCCESS,
  ALT_QR_CODE,
  TOTP_LABEL,
} from '../../common/constants';

const logger = new Logger('TOTP');

@Component({
  tag: 'amplify-totp',
  shadow: false,
})
export class AmplifyTOTP {
  /** Used in order to configure TOTP for a user */
  @Prop() authData: CognitoUserInterface = null;
  /** Triggers an TOTP Event after handleSubmit method has been called */
  @Prop() onTOTPEvent?: (event: TOTPSetupEventType, data: any, user: CognitoUserInterface) => void;
  /** Used to set autoFocus to true when TOTP Component has loaded */
  @Prop() inputProps: object = {
    autoFocus: true,
  };

  @State() code: string | null = null;
  @State() setupMessage: string | null = null;
  @State() qrCodeImageSource: string;
  @State() qrCodeInput: string;

  componentDidLoad() {
    this.setup();
  }

  triggerTOTPEvent(event: TOTPSetupEventType, data: any, user: CognitoUserInterface) {
    if (this.onTOTPEvent) {
      this.onTOTPEvent(event, data, user);
    }
  }

  handleTotpInputChange(event) {
    this.setupMessage = null;
    this.qrCodeInput = event.target.value;
  }

  async generateQRCode(codeFromTotp: string) {
    try {
      this.qrCodeImageSource = await QRCode.toDataURL(codeFromTotp);
    } catch (error) {
      throw new Error(error);
    }
  }

  setup() {
    this.setupMessage = null;
    const user = this.authData;
    const issuer = encodeURI('AWSCognito');

    if (!Auth || typeof Auth.setupTOTP !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }

    Auth.setupTOTP(user)
      .then(secretKey => {
        logger.debug('secret key', secretKey);
        const code = `otpauth://totp/${issuer}:${user.username}?secret=${secretKey}&issuer=${issuer}`;
        this.code = code;

        this.generateQRCode(this.code);
      })
      .catch(error => {
        logger.debug(TOTP_SETUP_FAILURE, error);
      });
  }

  verifyTotpToken() {
    if (event) {
      event.preventDefault();
    }

    if (!this.qrCodeInput) {
      logger.debug(NO_TOTP_CODE_PROVIDED);
      return;
    }

    const user = this.authData;

    if (!Auth || typeof Auth.verifyTotpToken !== 'function' || typeof Auth.setPreferredMFA !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }

    Auth.verifyTotpToken(user, this.qrCodeInput)
      .then(() => {
        Auth.setPreferredMFA(user, MfaMethod.TOTP);
        this.setupMessage = TOTP_SUCCESS_MESSAGE;
        logger.debug(TOTP_SUCCESS_MESSAGE);
        this.triggerTOTPEvent(SETUP_TOTP, SUCCESS, user);
      })
      .catch(error => {
        this.setupMessage = TOTP_SETUP_FAILURE;
        logger.error(error);
      });
  }

  // TODO add Toast component to the Top of the form section
  render() {
    return (
      <amplify-form-section
        headerText={TOTP_HEADER_TEXT}
        submitButtonText={TOTP_SUBMIT_BUTTON_TEXT}
        handleSubmit={() => this.verifyTotpToken()}
      >
        <div class={totp}>
          <img src={this.qrCodeImageSource} alt={ALT_QR_CODE} />
          <amplify-form-field
            label={TOTP_LABEL}
            inputProps={this.inputProps}
            fieldId="totpCode"
            name="totpCode"
            handleInputChange={event => this.handleTotpInputChange(event)}
          />
        </div>
      </amplify-form-section>
    );
  }
}
