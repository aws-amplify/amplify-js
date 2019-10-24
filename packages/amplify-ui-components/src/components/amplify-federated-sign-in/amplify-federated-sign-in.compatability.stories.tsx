/* @jsx createElement */

import { Auth } from '@aws-amplify/auth';
import { FederatedSignIn } from 'aws-amplify-react';
import { createElement, StrictMode } from 'react';
import { render } from 'react-dom';

// Mock to match `aws-amplify-react/__tests__/Auth/FederatedSignIn-test.tsx`
Auth.configure = () => ({});

const noop = () => {};

export default {
  title: 'amplify-federated-sign-in/FederatedSignIn',
  decorators: [
    story => {
      const node = document.createElement('main');
      render(<StrictMode>{story()}</StrictMode>, node);
      return node;
    },
  ],
};

export const rendersWithCorrectAuthState = () => (
  <FederatedSignIn authState="signIn" federated={{}} onStateChange={noop} />
);

export const rendersNothingWithIncorrectAuthState = () => (
  <FederatedSignIn authState="signedIn" federated={{}} onStateChange={noop} />
);

export const rendersNothingWithNoFederatedProp = () => <FederatedSignIn authState="signIn" onStateChange={noop} />;
