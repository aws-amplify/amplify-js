/* @jsx createElement */

import { OAuthButton } from 'aws-amplify-react';
import { createElement, StrictMode } from 'react';
import { render } from 'react-dom';

export default {
  title: 'amplify-oauth-button/compatability',
  decorators: [
    story => {
      const node = document.createElement('main');
      render(<StrictMode>{story()}</StrictMode>, node);
      return node;
    },
  ],
};

export const defaults = () => <OAuthButton />;
