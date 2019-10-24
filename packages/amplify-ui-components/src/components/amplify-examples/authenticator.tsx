import { h } from '@stencil/core';

const Example1 = () => (
  <div>
    <amplify-authenticator initial-auth-state={'confirmSignIn'} />
  </div>
);

export default {
  title: 'Sample Authenticator',
  Content: Example1,
};
