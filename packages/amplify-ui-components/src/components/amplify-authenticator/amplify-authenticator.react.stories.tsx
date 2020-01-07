/** @jsx createElement */

import * as knobs from '@storybook/addon-knobs';
import { createElement } from 'react';
import { render } from 'react-dom';

import { AmplifyAuthenticator } from '../../../../amplify-ui-react';

console.log({ AmplifyAuthenticator });

export default {
  title: 'amplify-authenticator/react',
  decorators: [
    story => {
      const root = document.createElement('main');

      render(story(), root);

      return root;
    },
  ],
};

export const defaults = () => <AmplifyAuthenticator />;

export const withFederated = () => (
  <AmplifyAuthenticator
    federated={{
      amazonClientId: knobs.text('Amazon client ID', 'amazon_client_id'),
      auth0Config: {
        clientID: knobs.text('Auth0 client ID', 'auth0_client_id'),
        domain: knobs.text('Auth0 account domain', 'example.auth0.com'),
        redirectUri: 'http://localhost:3000/',
        responseType: 'token id_token',
      },
      facebookAppId: knobs.text('Facebook app ID', 'facebook_app_id'),
      googleClientId: knobs.text('Google client ID', 'google_client_id'),
      oauthConfig: {},
    }}
  />
);
