import { h } from '@stencil/core';

const StorageSamples = () => (
  <amplify-authenticator>
    <amplify-s3-image imgKey="amplify-logo.png" width="100" />
  </amplify-authenticator>
);

export const StorageExample = {
  title: 'Storage Samples',
  Content: StorageSamples,
};
