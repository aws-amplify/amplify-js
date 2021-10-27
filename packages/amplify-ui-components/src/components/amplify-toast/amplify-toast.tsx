import { Component, Prop, h } from '@stencil/core';

/**
 * @slot (default) - Content placed inside the toast. If `message` prop is already set, then this content will be displayed to the right of the `message`.
 */
@Component({
	tag: 'amplify-toast',
	styleUrl: 'amplify-toast.scss',
	shadow: true,
})
export class AmplifyToast {
	/** Used in order to add a dismissable `x` for the Toast component */
	@Prop() handleClose: () => void;
	/** Message to be displayed inside the toast*/
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
				<button class="toast-close" onClick={this.handleClose} />
			</div>
		);
	}
}
