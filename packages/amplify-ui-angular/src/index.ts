import { appendToAmplifyUserAgent } from '@aws-amplify/core';
appendToAmplifyUserAgent('@aws-amplify/ui-angular');

// DIRECTIVES
export * from './directives/proxies';

// PACKAGE MODULE
export { AmplifyModule } from './amplify-module';
