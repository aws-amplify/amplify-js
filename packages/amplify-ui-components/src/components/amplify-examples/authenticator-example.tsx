import { h } from '@stencil/core';

const Authenticator = () => <amplify-authenticator usernameAttribute="email"></amplify-authenticator>;

export const AuthenticatorExample = {
  title: 'Sample Authenticator',
  Content: Authenticator,
};
