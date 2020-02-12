import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'amplify-toast',
  styleUrl: 'amplify-toast.scss',
  shadow: true,
})
export class AmplifyToast {
  /** Used in order to add a dismissable `x` for the Toast component */
  @Prop() handleClose: () => void;
  @Prop() message: string = '';

  /* 
  TODO #170365145: Work on a helper function that will populate and 
  update class colors for success / warning / failure messages 
  */

  render() {
    return (
      <div class="toast">
        <amplify-icon class="toast-icon" name="warning" />
        {this.message ? <span>{this.message}</span> : null}
        <slot />
        <a class="toast-close" onClick={this.handleClose} />
      </div>
    );
  }
}
