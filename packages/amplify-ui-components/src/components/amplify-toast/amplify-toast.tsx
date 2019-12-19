import { Component, Prop, h } from '@stencil/core';

import { toast, toastClose, toastIcon } from './amplify-toast.style';

@Component({
  tag: 'amplify-toast',
  shadow: false,
})
export class AmplifyToast {
  /** Used in order to add a dismissable `x` for the Toast component */
  @Prop() onClose: () => void;

  /* 
  TODO #170365145: Work on a helper function that will populate and 
  update class colors for success / warning / failure messages 
  */

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
