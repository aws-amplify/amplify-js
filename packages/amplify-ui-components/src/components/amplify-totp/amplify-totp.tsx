import { Component, Prop, State, h } from '@stencil/core';
import { Logger } from '@aws-amplify/core';
import { CognitoUserInterface, MFATOTPOptions } from '../../common/types/auth-types';
import { Auth } from '@aws-amplify/auth';

const logger = new Logger('TOTP');

// Add QR Code component / styling

@Component({
  tag: 'amplify-totp',
  shadow: false,
})
export class AmplifyTOTP {
  @Prop() authData: CognitoUserInterface = null;
  @Prop() MFATypes: MFATOTPOptions;
  @Prop() onTOTPEvent?: (event: any, data: any, user: any) => void;

  @State() mfaType: boolean;
  @State() code: string = null;
  @State() setupMessage: string = null;

  componentDidLoad() {
    // this.setup(); needs to be called
    logger.log('Totp Rendered');
  }

  handleInputChange(event) {
    if (event) {
      event.preventDefault();
    }
    // Fill in more
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
        const code = 'otpauth://totp/' + issuer + ':' + user.username + '?secret=' + data + '&issuer=' + issuer;
        this.code = code;
      })
      .catch(error => logger.debug('totp setup failed', error));
  }

  verifyTotpToken() {
    // if (!this.inputs) {
    // 	logger.debug('no input');
    // 	return;
    // }
    const user = this.authData;
    // const { totpCode } = this.inputs;
    if (!Auth || typeof Auth.verifyTotpToken !== 'function' || typeof Auth.setPreferredMFA !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }
    Auth.verifyTotpToken(user, totpCode)
      .then(() => {
        // set it to preferred mfa
        Auth.setPreferredMFA(user, 'TOTP');
        // this.setState({ setupMessage: 'Setup TOTP successfully!' });
        logger.debug('set up totp success!');
        // this.triggerTOTPEvent('Setup TOTP', 'SUCCESS', user);
      })
      .catch(err => {
        // this.setState({ setupMessage: 'Setup TOTP failed!' });
        logger.error(err);
      });
  }

  showSecretCode(code) {
    if (!code) return null;

    return (
      <div>
        {/* Need to place className in below div */}
        <div>{/* QR Code */}</div>
        <amplify-input
          // autoFocus={true}
          key="totpCode"
          name="totpCode"
          handleInputChange={event => this.handleInputChange(event)}
        ></amplify-input>
      </div>
    );
  }

  render() {
    return (
      <amplify-form-section>
        {/* Need to place into body */}
        {this.showSecretCode(this.code)}
      </amplify-form-section>
    );
  }
}
