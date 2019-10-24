/* @jsx createElement */

import { Auth } from '@aws-amplify/auth';
import { FederatedButtons } from 'aws-amplify-react';
import { createElement, StrictMode } from 'react';
import { render } from 'react-dom';

// Mock to match `aws-amplify-react/__tests__/Auth/FederatedSignIn-test.tsx`
Auth.configure = () => ({});

const noop = () => {};
const withReact = story => () => {
  const node = document.createElement('main');
  render(<StrictMode>{story()}</StrictMode>, node);
  return node;
};

export default { title: 'amplify-federated-buttons' };

export const withDefaults = () => '<amplify-federated-buttons></amplify-federated-buttons>';

export const renderWithCorrectAuthState = withReact(() => (
  <FederatedButtons
    authState="signIn"
    federated={{
      google_client_id: 'google_client_id',
      facebook_app_id: 'facebook_app_id',
    }}
    onStateChange={noop}
  />
));

export const renderWithCorrectAuthStateAndOnlyFacebookId = withReact(() => (
  <FederatedButtons
    authState="signIn"
    federated={{
      facebook_app_id: 'facebook_app_id',
    }}
    onStateChange={noop}
  />
));

export const renderWithCorrectAuthStateAndOnlyGoogleId = withReact(() => (
  <FederatedButtons
    authState="signIn"
    federated={{
      google_client_id: 'google_client_id',
    }}
    onStateChange={noop}
  />
));

export const renderNothingWithIncorrectAuthState = withReact(() => (
  <FederatedButtons authState="signedIn" federated={{}} onStateChange={noop} />
));

export const renderNothingWithNoFederatedProp = withReact(() => (
  <FederatedButtons authState="signedIn" federated={undefined} onStateChange={noop} />
));
