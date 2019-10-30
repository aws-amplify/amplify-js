import { AmazonButton } from 'aws-amplify-react';

import { h, withReact } from '../../common/withReact';

export default {
  title: 'amplify-amazon-button/compatability',
  decorators: [withReact],
};

export const defaults = () => <AmazonButton />;
