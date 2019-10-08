import { h } from '@stencil/core';
import Auth from '@aws-amplify/auth';
import XR from '@aws-amplify/xr';
// import Amplify from 'aws-amplify';
import awsExports from './src/aws-exports';

Auth.configure(awsExports);
XR.configure(awsExports);
// Amplify.configure(aws_exports);

const sceneExample = () => <amplify-scene sceneName={'scene1'} />;

export default {
  title: 'Scene example',
  Content: sceneExample,
};
