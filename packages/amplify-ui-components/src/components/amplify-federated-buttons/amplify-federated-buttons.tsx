import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

@Component({
  tag: 'amplify-federated-buttons',
  shadow: false,
})
export class AmplifyFederatedButtons {
  /** The current authentication state. */
  @Prop() authState: 'signIn' | 'signedOut' | 'signedUp' = 'signIn';
  /** Federated credentials & configuration. */
  @Prop() federated: any = {};
  /** Listener when `authState` changes */
  @Event() stateChange: EventEmitter;

  render() {
    return (
      <div>
        <slot />
      </div>
    );
  }
}
