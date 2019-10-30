import { FacebookButton } from 'aws-amplify-react';

import { h, withReact } from '../../common/withReact';

export default {
  title: 'amplify-facebook-button/compatability',
  decorators: [withReact],
};

export const defaults = () => <FacebookButton />;
