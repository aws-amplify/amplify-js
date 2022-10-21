import { Component, h, Prop } from '@stencil/core';

/**
 * @slot (default) - Text displayed below the tooltip. This will always be visible.
 */
@Component({
	tag: 'amplify-tooltip',
	styleUrl: 'amplify-tooltip.scss',
	shadow: true,
})
export class AmplifyTooltip {
	/** (Required) The text in the tooltip */
	@Prop() text: string;
	/** (Optional) Whether or not the tooltip should be automatically shown, i.e. not disappear when not hovered */
	@Prop() shouldAutoShow: boolean = false;

	render() {
		return (
			<div
				class={{ tooltip: true, 'auto-show-tooltip': this.shouldAutoShow }}
				data-text={this.text}
			>
				<slot />
			</div>
		);
	}
}
