import { h } from '@stencil/core';

import { knobs } from '../../common/testing';

export default {
  title: 'amplify-verify-contact',
};

const unverified = {
  unverified: {
    email: 'email@amazon.com',
    phone_number: '+12345678901',
  },
};

export const withNoProps = () => <amplify-verify-contact />;

export const withAuthState = () => (
  <amplify-verify-contact
    authData={unverified}
    // @ts-ignore
    authState="verifyContact"
    onAuthEvent={(...args) => console.info('onAuthEvent', ...args)}
    onStateChange={(...args) => console.info('onStateChange', ...args)}
    overrideStyle={knobs.overrideStyleKnob()}
  />
);
