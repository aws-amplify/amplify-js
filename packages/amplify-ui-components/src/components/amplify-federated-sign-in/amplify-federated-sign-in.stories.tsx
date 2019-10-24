/* @jsx createElement */

import { Auth } from '@aws-amplify/auth';
import { FederatedSignIn } from 'aws-amplify-react';
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

export default { title: 'amplify-federated-sign-in' };

export const withDefaults = () => '<amplify-federated-sign-in></amplify-federated-sign-in>';

export const rendersWithCorrectAuthState = withReact(() => (
  <FederatedSignIn authState="signIn" federated={{}} onStateChange={noop} />
));

export const rendersNothingWithIncorrectAuthState = withReact(() => (
  <FederatedSignIn authState="signedIn" federated={{}} onStateChange={noop} />
));

export const rendersNothingWithNoFederatedProp = withReact(() => (
  <FederatedSignIn authState="signIn" onStateChange={noop} />
));
