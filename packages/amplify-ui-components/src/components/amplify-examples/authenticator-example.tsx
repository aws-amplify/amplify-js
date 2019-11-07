import { h } from '@stencil/core';
// import Auth from '@aws-amplify/auth';

const Authenticator = () => (
  <amplify-authenticator>
    <h1>My App</h1>
  </amplify-authenticator>
);

export const AuthenticatorExample = {
  title: 'Sample Authenticator',
  Content: Authenticator,
};
