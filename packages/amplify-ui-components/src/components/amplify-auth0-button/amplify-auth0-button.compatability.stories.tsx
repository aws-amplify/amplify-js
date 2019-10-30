import { Auth0Button } from 'aws-amplify-react';

import { h, withReact } from '../../common/withReact';

export default {
  title: 'amplify-auth0-button/compatability',
  decorators: [withReact],
};

export const defaults = () => <Auth0Button />;
