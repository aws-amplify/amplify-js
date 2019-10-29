import { h } from '../../common/jsx2dom';

const handleStateChange = (...args) => {
  console.log('handleStateChange', ...args);
};

export default {
  title: 'amplify-federated-buttons',
};

export const renderWithCorrectAuthState = () => (
  <amplify-federated-buttons
    authState="signIn"
    federated={{
      google_client_id: 'google_client_id',
      facebook_app_id: 'facebook_app_id',
    }}
    onStateChange={handleStateChange}
  />
);

export const renderWithCorrectAuthStateAndOnlyFacebookId = () => (
  <amplify-federated-buttons
    authState="signIn"
    federated={{
      facebook_app_id: 'facebook_app_id',
    }}
    onStateChange={handleStateChange}
  />
);

export const renderWithCorrectAuthStateAndOnlyGoogleId = () => (
  <amplify-federated-buttons
    authState="signIn"
    federated={{
      google_client_id: 'google_client_id',
    }}
    onStateChange={handleStateChange}
  />
);

export const renderNothingWithIncorrectAuthState = () => (
  <amplify-federated-buttons authState="signedIn" federated={{}} onStateChange={handleStateChange} />
);

export const renderNothingWithNoFederatedProp = () => (
  <amplify-federated-buttons authState="signedIn" federated={undefined} onStateChange={handleStateChange} />
);
