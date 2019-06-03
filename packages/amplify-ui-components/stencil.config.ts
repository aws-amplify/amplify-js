import { Config } from '@stencil/core';
import builtins from 'rollup-plugin-node-builtins';

export const config: Config = {
  namespace: 'amplify-ui-components',
  plugins: [
    builtins()
  ],
  outputTargets: [
    { type: 'dist' },
    { type: 'docs-readme' },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ]
};
