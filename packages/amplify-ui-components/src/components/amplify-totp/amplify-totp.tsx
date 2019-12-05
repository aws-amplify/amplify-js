import { Component, Prop, State, h } from '@stencil/core';
import { Logger } from '@aws-amplify/core';
import { CognitoUserInterface, MFATOTPOptions } from '../../common/types/auth-types';
// import { Auth } from '@aws-amplify/auth';

const logger = new Logger('TOTP');

@Component({
  tag: 'amplify-totp',
  shadow: false,
})
export class AmplifyTOTP {
  @Prop() authData: CognitoUserInterface = null;
  @Prop() MFATypes: MFATOTPOptions;

  @State() mfaType: boolean;

  componentDidLoad() {
    logger.log('Totp Rendered');
  }

  render() {
    return <div>TOTP</div>;
  }
}
