import { h } from '@stencil/core';

const Example2 = () => (
  <div>
    <amplify-authenticator
      content={() => (
        <div>
          <p>
            <strong>My app with default login!</strong>
          </p>
          <p>Some app content here</p>
        </div>
      )}
    />
  </div>
);

export default {
  title: 'Authenticator with default sign-in form',
  Content: Example2,
};
