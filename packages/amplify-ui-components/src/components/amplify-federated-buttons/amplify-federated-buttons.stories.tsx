import { AmplifyFederatedButtons } from './amplify-federated-buttons';

const handleStateChange = (...args) => {
  console.log('handleStateChange', ...args);
};

export default {
  title: 'amplify-federated-buttons',
};

export const renderWithCorrectAuthState = () => {
  const element = new AmplifyFederatedButtons();

  element.authState = 'signIn';
  element.federated = {
    google_client_id: 'google_client_id',
    facebook_app_id: 'facebook_app_id',
  };

  element.handleAuthStateChange = handleStateChange;

  return element;
};

export const renderWithCorrectAuthStateAndOnlyFacebookId = () => {
  const element = new AmplifyFederatedButtons();

  element.authState = 'signIn';
  element.federated = {
    facebook_app_id: 'facebook_app_id',
  };
  element.handleAuthStateChange = handleStateChange;

  return element;
};

export const renderWithCorrectAuthStateAndOnlyGoogleId = () => {
  const element = new AmplifyFederatedButtons();

  element.authState = 'signIn';
  element.federated = {
    google_client_id: 'google_client_id',
  };
  element.handleAuthStateChange = handleStateChange;

  return element;
};

export const renderNothingWithIncorrectAuthState = () => {
  const element = new AmplifyFederatedButtons();

  // @ts-ignore intentionally setting invalid state
  element.authState = 'someInvalidState';
  element.federated = {};
  element.handleAuthStateChange = handleStateChange;

  return element;
};

export const renderNothingWithNoFederatedProp = () => {
  const element = new AmplifyFederatedButtons();

  // @ts-ignore intentionally setting invalid state
  element.authState = 'someInvalidState';
  element.federated = undefined;
  element.handleAuthStateChange = handleStateChange;

  return element;
};
