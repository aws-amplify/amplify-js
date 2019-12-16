/** @jsx createElement */

import { createElement } from 'react';
import { render } from 'react-dom';

import { VerifyContact } from '../../../../aws-amplify-react';

export default {
  title: 'amplify-verify-contact/react',
  decorators: [
    story => {
      const root = document.createElement('main');

      render(story(), root);

      return root;
    },
  ],
};

export const withNoProps = () => <VerifyContact />;

export const withAuthState = () => (
  <VerifyContact
    authData={{
      unverified: {
        email: 'email@amazon.com',
        phone_number: '+12345678901',
      },
    }}
    authState="verifyContact"
    onAuthEvent={(...args) => console.info('onAuthEvent', ...args)}
    onStateChange={(...args) => console.info('onStateChange', ...args)}
  />
);
