import { h } from '@stencil/core';
import Auth from '@aws-amplify/auth';
import XR from '@aws-amplify/xr';
// import Amplify from 'aws-amplify';
import aws_exports from './src/aws-exports';

Auth.configure(aws_exports);
XR.configure(aws_exports);
// Amplify.configure(aws_exports);

const sceneExample = () => <amplify-scene sceneName={'scene1'} />;

export default {
  title: 'Scene example',
  Content: sceneExample,
};
