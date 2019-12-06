import { Component, Prop, State, h } from '@stencil/core';
import QRCode from 'qrcode';

import { Logger } from '@aws-amplify/core';
import { CognitoUserInterface, MFATOTPOptions } from '../../common/types/auth-types';
import { Auth } from '@aws-amplify/auth';
import { totp } from './amplify-totp.style';

const logger = new Logger('TOTP');

// Add QR Code component / styling

@Component({
  tag: 'amplify-totp',
  shadow: false,
})
export class AmplifyTOTP {
  public inputs: any;

  @Prop() authData: CognitoUserInterface = null;
  @Prop() MFATypes: MFATOTPOptions;
  // @Prop() onTOTPEvent?: (event: any, data: any, user: CognitoUserInterface) => void;

  @State() code: string | boolean | null = true;
  @State() setupMessage: string | null = null;

  @State() qrCodeImageSource: string;

  componentDidLoad() {
    // this.setup(); needs to be called
    logger.log('Totp Rendered');
  }

  // triggerTOTPEvent(event, data, user) {
  //   if (this.onTOTPEvent) {
  //     this.onTOTPEvent(event, data, user);
  //   }
  // }

  handleInputChange(event) {
    if (event) {
      event.preventDefault();
    }
    this.setupMessage = null;
    this.inputs = {};
    const { name, value, type, checked } = event.target;
    // @ts-ignore
    const check_type = ['radio', 'checkbox'].includes(type);
    this.inputs[name] = check_type ? checked : value;
  }

  setup() {
    this.setupMessage = null;
    const user = this.authData;
    const issuer = encodeURI('AWSCognito');

    if (!Auth || typeof Auth.setupTOTP !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    Auth.setupTOTP(user)
      .then(data => {
        logger.debug('secret key', data);
        const code = `otpauth://totp/${issuer}:${user.username}?secret=${data}&issuer=${issuer}`;
        this.code = code;
      })
      .catch(error => logger.debug('TOTP setup failed', error));
  }

  verifyTotpToken() {
    if (!this.inputs) {
      logger.debug('no input');
      return;
    }
    const user = this.authData;
    const { totpCode } = this.inputs;
    if (!Auth || typeof Auth.verifyTotpToken !== 'function' || typeof Auth.setPreferredMFA !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }
    Auth.verifyTotpToken(user, totpCode)
      .then(() => {
        Auth.setPreferredMFA(user, 'TOTP');
        this.setupMessage = 'Setup TOTP successfully!';
        logger.debug('set up totp success!');
        // this.triggerTOTPEvent('Setup TOTP', 'SUCCESS', user);
      })
      .catch(err => {
        this.setupMessage = 'Setup TOTP failed!';
        logger.error(err);
      });
  }

  showSecretCode(code) {
    if (!code) return null;

    const generateQRCode = async text => {
      try {
        this.qrCodeImageSource = await QRCode.toDataURL(text);
        console.log(this.qrCodeImageSource);
      } catch (error) {
        throw new Error(error);
      }
    };

    generateQRCode('test');

    return (
      <div class={totp}>
        {/* Need to place className in below div */}
        <img src={this.qrCodeImageSource} alt="qr-code" />
        <amplify-input
          // autoFocus={true}
          key="totpCode"
          name="totpCode"
          handleInputChange={event => this.handleInputChange(event)}
        ></amplify-input>
      </div>
    );
  }
  // TODO add Toast component to the Top of the form section
  render() {
    return (
      <amplify-form-section headerText="Scan then enter verification code" submitButtonText="Verify Security Token">
        {this.showSecretCode(this.code)}
      </amplify-form-section>
    );
  }
}
