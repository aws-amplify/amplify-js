import { Component, h } from '@stencil/core';

@Component({
  tag: 'amplify-federated-sign-in',
  shadow: false,
})
export class AmplifyFederatedSignIn {
  render() {
    return (
      <div>
        Howdy there!
        <slot />
      </div>
    );
  }
}
