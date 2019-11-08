import { h } from '@stencil/core';

const Authenticator = () => (
  <amplify-authenticator>
    <h1>My App</h1>
  </amplify-authenticator>
);

export const AuthenticatorExample = {
  title: 'Sample Authenticator',
  Content: Authenticator,
};
