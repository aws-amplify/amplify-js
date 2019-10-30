import { Auth } from '@aws-amplify/auth';
import { FederatedSignIn } from 'aws-amplify-react';

import { h, withReact } from '../../common/withReact';

// Mock to match `aws-amplify-react/__tests__/Auth/FederatedSignIn-test.tsx`
Auth.configure = () => ({});

const noop = () => {};

export default {
  title: 'amplify-federated-sign-in/compatability',
  decorators: [withReact],
};

export const rendersWithCorrectAuthState = () => (
  <FederatedSignIn authState="signIn" federated={{}} onStateChange={noop} />
);

export const rendersNothingWithIncorrectAuthState = () => (
  <FederatedSignIn authState="signedIn" federated={{}} onStateChange={noop} />
);

export const rendersNothingWithNoFederatedProp = () => <FederatedSignIn authState="signIn" onStateChange={noop} />;
