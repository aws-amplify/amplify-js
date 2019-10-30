import * as knobs from '@storybook/addon-knobs';
import { h } from '../../common/jsx2dom';

export default {
  title: 'amplify-sign-in',
};

export const withOverrideStyle = () => <amplify-sign-in overrideStyle={knobs.boolean('Override style', false)} />;

export const withFederated = () => (
  <amplify-sign-in
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
