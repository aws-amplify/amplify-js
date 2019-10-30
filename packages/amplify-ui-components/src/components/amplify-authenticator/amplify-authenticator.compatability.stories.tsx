import * as knobs from '@storybook/addon-knobs';
import { Authenticator } from 'aws-amplify-react';

import { h, withReact } from '../../common/withReact';

export default {
  title: 'amplify-authenticator/compatability',
  decorators: [withReact],
};

export const defaults = () => <Authenticator />;

export const withFederated = () => {
  return (
    <Authenticator
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
};
