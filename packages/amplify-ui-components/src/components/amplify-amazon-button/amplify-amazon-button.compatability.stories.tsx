/* @jsx createElement */

import { AmazonButton } from 'aws-amplify-react';
import { createElement, StrictMode } from 'react';
import { render } from 'react-dom';

export default {
  title: 'amplify-amazon-button/compatability',
  decorators: [
    story => {
      const node = document.createElement('main');
      render(<StrictMode>{story()}</StrictMode>, node);
      return node;
    },
  ],
};

export const defaults = () => <AmazonButton />;
