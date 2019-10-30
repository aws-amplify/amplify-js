import { Config } from '@stencil/core';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export const config: Config = {
  excludeSrc: ['**/**.stories.*', '**/*.style.*', '**/common/**'],
  namespace: 'amplify-ui-components',
  plugins: [nodePolyfills()],
  commonjs: {
    namedExports: {
      '@aws-sdk/credential-provider-cognito-identity': ['fromCognitoIdentity', 'fromCognitoIdentityPool'],
      '@aws-crypto/sha256-browser': ['Sha256'],
      uuid: ['v1', 'v4'],
      lodash: ['isEmpty', 'isEqual', 'get'],
      '@aws-sdk/eventstream-marshaller': ['EventStreamMarshaller'],
    },
  },
  outputTargets: [
    { type: 'dist' },
    { type: 'docs-readme' },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  globalStyle: 'src/global/variables.css',
};
