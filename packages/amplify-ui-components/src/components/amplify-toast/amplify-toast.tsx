import { Component, Prop, h } from '@stencil/core';

import { toast, toastClose, toastIcon } from './amplify-toast.style';

@Component({
  tag: 'amplify-toast',
  shadow: false,
})
export class AmplifyToast {
  /** Used in order to add a clickable `exit` button for the Toast component */
  @Prop() onClose: () => void;

  render() {
    return (
      <div class={toast}>
        <amplify-icon class={toastIcon} name="warning" />
        <slot />
        <a class={toastClose} onClick={this.onClose} />
      </div>
    );
  }
}
