import { h } from '@stencil/core';

const CustomAuthenticator = () => (
  <amplify-authenticator>
    <amplify-sign-in slot="sign-in" headerText="Custom Sign In Header" />
    <amplify-sign-up slot="sign-up" headerText="Custom Sign Up Header" />
    <div>My app</div>
  </amplify-authenticator>
);

export const CustomAuthenticatorExample = {
  title: 'Sample Custom Authenticator',
  Content: CustomAuthenticator,
};
