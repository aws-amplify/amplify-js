import { OAuthButton } from 'aws-amplify-react';

import { h, withReact } from '../../common/withReact';

export default {
  title: 'amplify-oauth-button/compatability',
  decorators: [withReact],
};

export const defaults = () => <OAuthButton />;
