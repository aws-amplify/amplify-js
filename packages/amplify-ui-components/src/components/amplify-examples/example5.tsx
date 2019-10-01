import { h } from '@stencil/core';
// import Amplify from 'aws-amplify'
// import aws_exports from './aws-exports';

// Amplify.configure(aws_exports);
// // XR.configure(aws_exports);

const Example5 = () => <amplify-scene sceneName={'scene1'} style={{ height: '600px' }} />;

export default {
  title: 'Scene example',
  Content: Example5,
};
