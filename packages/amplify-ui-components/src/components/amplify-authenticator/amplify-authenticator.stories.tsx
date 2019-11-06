import { h } from '@stencil/core';
import * as knobs from '@storybook/addon-knobs';

export default {
  title: 'amplify-authenticator',
};

export const defaults = () => <amplify-authenticator />;

export const withFederated = () => (
  <amplify-authenticator
    federated={{
      amazon_client_id: knobs.text('Amazon client ID', 'amazon_client_id'),
      auth0: {
        clientID: knobs.text('Auth0 client ID', 'auth0_client_id'),
        domain: knobs.text('Auth0 account domain', 'example.auth0.com'),
      },
      facebook_app_id: knobs.text('Facebook app ID', 'facebook_app_id'),
      google_client_id: knobs.text('Google client ID', 'google_client_id'),
      oauth_config: {},
    }}
  />
);
