/* @jsx createElement */

import { Auth0Button } from 'aws-amplify-react';
import { createElement, StrictMode } from 'react';
import { render } from 'react-dom';

export default {
  title: 'amplify-auth0-button/compatability',
  decorators: [
    story => {
      const node = document.createElement('main');
      render(<StrictMode>{story()}</StrictMode>, node);
      return node;
    },
  ],
};

export const defaults = () => <Auth0Button />;
