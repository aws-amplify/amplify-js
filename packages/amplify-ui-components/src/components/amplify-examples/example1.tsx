import { h } from '@stencil/core';

const Example1 = () => (
  <div>
    <amplify-authenticator initial-auth-state="signup" />
  </div>
);

export default {
  title: 'Sample Authenticator',
  Content: Example1,
};
