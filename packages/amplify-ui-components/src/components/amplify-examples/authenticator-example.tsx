import { h } from '@stencil/core';

const Authenticator = () => <amplify-authenticator usernameAttribute="phone_number"></amplify-authenticator>;

export const AuthenticatorExample = {
  title: 'Sample Authenticator',
  Content: Authenticator,
};
