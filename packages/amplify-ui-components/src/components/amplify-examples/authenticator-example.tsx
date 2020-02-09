import { h } from '@stencil/core';

const Authenticator = () => (
  <amplify-authenticator>
    <amplify-sign-in slot="signIn" headerText="meow" />
    <amplify-sign-up slot="signUp" headerText="meow2" />
  </amplify-authenticator>
);

export const AuthenticatorExample = {
  title: 'Sample Authenticator',
  Content: Authenticator,
};
