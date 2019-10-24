import { Component, h } from '@stencil/core';

@Component({
  tag: 'amplify-federated-buttons',
  shadow: false,
})
export class AmplifyFederatedButtons {
  render() {
    return (
      <div>
        <slot />
      </div>
    );
  }
}
