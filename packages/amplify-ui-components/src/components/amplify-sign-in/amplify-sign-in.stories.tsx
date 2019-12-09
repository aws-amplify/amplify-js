import { h } from '@stencil/core';
import * as knobs from '@storybook/addon-knobs';

export default {
  title: 'amplify-sign-in',
};

export const withOverrideStyle = () => <amplify-sign-in overrideStyle={knobs.boolean('Override style', false)} />;

export const withEmptyFederatedObject = () => <amplify-sign-in federated={{}} />;

export const withFederated = () => (
  <amplify-sign-in
    federated={{
      amazonClientId: knobs.text('Amazon client ID', 'amazon_client_id'),
      auth0Config: {
        clientID: knobs.text('Auth0 client ID', 'auth0_client_id'),
        domain: knobs.text('Auth0 account domain', 'example.auth0.com'),
      },
      facebookAppId: knobs.text('Facebook app ID', 'facebook_app_id'),
      googleClientId: knobs.text('Google client ID', 'google_client_id'),
      oauthConfig: {},
    }}
  />
);

export const withFederatedAndOverrideStyle = () => (
  <amplify-sign-in
    federated={{
      amazonClientId: knobs.text('Amazon client ID', 'amazon_client_id'),
      auth0Config: {
        clientID: knobs.text('Auth0 client ID', 'auth0_client_id'),
        domain: knobs.text('Auth0 account domain', 'example.auth0.com'),
      },
      facebookAppId: knobs.text('Facebook app ID', 'facebook_app_id'),
      googleClientId: knobs.text('Google client ID', 'google_client_id'),
      oauthConfig: {},
    }}
    overrideStyle
  />
);
