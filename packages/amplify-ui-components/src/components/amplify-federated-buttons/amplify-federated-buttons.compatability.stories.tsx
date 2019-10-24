/* @jsx createElement */

import { Auth } from '@aws-amplify/auth';
import { FederatedButtons } from 'aws-amplify-react';
import { createElement, StrictMode } from 'react';
import { render } from 'react-dom';

// Mock to match `aws-amplify-react/__tests__/Auth/FederatedSignIn-test.tsx`
Auth.configure = () => ({});

const noop = () => {};

export default {
  title: 'amplify-federated-buttons/FederatedButtons',
  decorators: [
    story => {
      const node = document.createElement('main');
      render(<StrictMode>{story()}</StrictMode>, node);
      return node;
    },
  ],
};

export const renderWithCorrectAuthState = () => (
  <FederatedButtons
    authState="signIn"
    federated={{
      google_client_id: 'google_client_id',
      facebook_app_id: 'facebook_app_id',
    }}
    onStateChange={noop}
  />
);

export const renderWithCorrectAuthStateAndOnlyFacebookId = () => (
  <FederatedButtons
    authState="signIn"
    federated={{
      facebook_app_id: 'facebook_app_id',
    }}
    onStateChange={noop}
  />
);

export const renderWithCorrectAuthStateAndOnlyGoogleId = () => (
  <FederatedButtons
    authState="signIn"
    federated={{
      google_client_id: 'google_client_id',
    }}
    onStateChange={noop}
  />
);

export const renderNothingWithIncorrectAuthState = () => (
  <FederatedButtons authState="signedIn" federated={{}} onStateChange={noop} />
);

export const renderNothingWithNoFederatedProp = () => (
  <FederatedButtons authState="signedIn" federated={undefined} onStateChange={noop} />
);
