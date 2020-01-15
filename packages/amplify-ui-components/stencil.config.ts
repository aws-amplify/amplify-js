import { Config } from '@stencil/core';
import { angularOutputTarget } from '@stencil/angular-output-target';
import { reactOutputTarget } from '@stencil/react-output-target';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export const config: Config = {
  excludeSrc: ['**/*.e2e.*', '**/*.spec.*', '**/*.stories.*'],
  namespace: 'amplify-ui-components',
  plugins: [nodePolyfills()],
  commonjs: {
    namedExports: {
      '@aws-sdk/client-cognito-identity-browser': ['CognitoIdentityClient', 'GetIdCommand'],
      '@aws-sdk/credential-provider-cognito-identity': ['fromCognitoIdentity', 'fromCognitoIdentityPool'],
      '@aws-crypto/sha256-js': ['Sha256'],
      uuid: ['v1', 'v4'],
      lodash: ['isEmpty', 'isEqual', 'get'],
      '@aws-sdk/eventstream-marshaller': ['EventStreamMarshaller'],
    },
  },
  outputTargets: [
    // See: https://github.com/ionic-team/stencil-ds-plugins#angular
    angularOutputTarget({
      componentCorePackage: '@aws-amplify/ui-components',
      directivesProxyFile: '../amplify-ui-angular/src/directives/proxies.ts',
    }),
    reactOutputTarget({
      componentCorePackage: '@aws-amplify/ui-components',
      proxiesFile: '../amplify-ui-react/src/components.ts',
    }),
    { type: 'dist' },
    { type: 'docs-readme' },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  globalStyle: 'src/global/variables.css',
};
