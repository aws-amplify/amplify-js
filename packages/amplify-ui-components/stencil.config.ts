import { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil/react-output-target';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export const config: Config = {
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
    reactOutputTarget({
      componentCorePackage: '@aws-amplify/ui-components',
      proxiesFile: '../amplify-ui-react/src/components.ts',
    }),
  ],
  globalStyle: 'src/global/variables.css',
};
