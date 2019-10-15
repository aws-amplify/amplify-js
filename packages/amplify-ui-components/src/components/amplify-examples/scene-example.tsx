import { h } from '@stencil/core';
import Auth from '@aws-amplify/auth';
import XR from '@aws-amplify/xr';
import awsexports from './src/aws-exports';

Auth.configure(awsexports);
XR.configure(awsexports);

const sceneExample = () => <amplify-scene sceneName={'scene1'} />;

export default {
  title: 'Scene example',
  Content: sceneExample,
};
