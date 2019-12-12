import { h } from '@stencil/core';
import { Auth } from '@aws-amplify/auth';

let authData;

Auth.currentAuthenticatedUser().then(data => {
  authData = data;
  console.log('Auth data set', authData);
});

const MfaTypes = {
  Optional: true,
  TOTP: true,
  SMS: false,
};

const TOTPAuthenticator = () => (
  <amplify-authenticator>
    <amplify-select-mfa-type MFATypes={MfaTypes} authData={authData}></amplify-select-mfa-type>
  </amplify-authenticator>
);

const TOTPAuthenticatorExample = {
  title: 'TOTP Example',
  Content: TOTPAuthenticator,
};

export default TOTPAuthenticatorExample;
