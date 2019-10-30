/* @jsx createElement */

import * as knobs from '@storybook/addon-knobs';
import { Authenticator } from 'aws-amplify-react';
import { createElement, StrictMode } from 'react';
import { render } from 'react-dom';

export default {
  title: 'amplify-authenticator/compatability',
  decorators: [
    story => {
      const node = document.createElement('main');
      render(<StrictMode>{story()}</StrictMode>, node);
      return node;
    },
  ],
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
