import { h } from '@stencil/core';

const Authenticator = () => (
  <amplify-authenticator>
    <amplify-sign-in slot="sign-in" headerText="Custom Sign In Header" />
    <amplify-sign-up slot="sign-up" headerText="Custom Sign Up Header" />
  </amplify-authenticator>
);

export const AuthenticatorExample = {
  title: 'Sample Authenticator',
  Content: Authenticator,
};
