import { h } from '@stencil/core';

export default {
  title: 'amplify-strike',
};

export const withOverrideStyle = () => <amplify-strike overrideStyle>Unstyled</amplify-strike>;
export const withText = () => <amplify-strike>or</amplify-strike>;
