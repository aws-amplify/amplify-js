import { GoogleButton } from 'aws-amplify-react';

import { h, withReact } from '../../common/withReact';

export default {
  title: 'amplify-google-button/compatability',
  decorators: [withReact],
};

export const defaults = () => <GoogleButton />;
