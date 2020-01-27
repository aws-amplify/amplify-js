import { Config } from '@stencil/core';
import { angularOutputTarget } from '@stencil/angular-output-target';
import { reactOutputTarget } from '@stencil/react-output-target';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export const config: Config = {
  excludeSrc: ['**/*.e2e.*', '**/*.spec.*', '**/*.stories.*'],
  namespace: 'amplify-ui-components',
  plugins: [nodePolyfills()],
  hashFileNames: false,
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
  bundles: [
    { components: ['amplify-amazon-button', 'amplify-auth-fields', 'amplify-auth0-button', 'amplify-authenticator', 'amplify-sign-in'] },
    { components: ['amplify-confirm-sign-in', 'amplify-confirm-sign-up', 'amplify-facebook-button', 'amplify-federated-buttons', 'amplify-federated-sign-in'] },
    { components: ['amplify-google-button', 'amplify-forgot-password', 'amplify-select-mfa-type', 'amplify-sign-out', 'amplify-sign-up'] },
    { components: ['amplify-totp-setup', 'amplify-verify-contact'] },
  ],
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
