import { h } from '@stencil/core';
import Auth from '@aws-amplify/auth';
import XR from '@aws-amplify/xr';
import awsExports from './src/aws-exports';

Auth.configure(awsExports);
XR.configure(awsExports);

const sceneExample = () => <amplify-scene sceneName={'scene1'} />;

export default {
  title: 'Scene example',
  Content: sceneExample,
};
