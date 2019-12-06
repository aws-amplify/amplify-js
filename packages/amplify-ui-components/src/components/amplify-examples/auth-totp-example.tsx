import { h } from '@stencil/core';
import { Auth } from '@aws-amplify/auth';

let authData;

Auth.currentAuthenticatedUser().then(data => {
  authData = data;
  console.log('Auth data set', authData);
});

const TOTPAuthenticator = () => (
  <amplify-authenticator>
    <amplify-totp authData={authData}></amplify-totp>
  </amplify-authenticator>
);

const TOTPAuthenticatorExample = {
  title: 'TOTP Example',
  Content: TOTPAuthenticator,
};

export default TOTPAuthenticatorExample;
