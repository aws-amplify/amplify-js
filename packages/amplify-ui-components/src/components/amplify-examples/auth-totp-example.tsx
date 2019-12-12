import { h } from '@stencil/core';
import { Auth } from '@aws-amplify/auth';

let authData;

Auth.currentAuthenticatedUser().then(data => {
  authData = data;
  console.log('Auth data set', authData);
});

const TOTPAuthenticator = () => (
  <amplify-authenticator>
    <amplify-select-mfa-type authData={authData}></amplify-select-mfa-type>
  </amplify-authenticator>
);

const TOTPAuthenticatorExample = {
  title: 'TOTP Example',
  Content: TOTPAuthenticator,
};

export default TOTPAuthenticatorExample;
