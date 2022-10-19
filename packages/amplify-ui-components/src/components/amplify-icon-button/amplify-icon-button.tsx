import { Component, Prop, h } from '@stencil/core';
import { IconNameType } from '../amplify-icon/icons';

@Component({
	tag: 'amplify-icon-button',
	styleUrl: 'amplify-icon-button.scss',
	shadow: true,
})
export class AmplifyIconButton {
	/**  The name of the icon used inside of the button */
	@Prop() name: IconNameType;
	/** (Optional) The tooltip that will show on hover of the button */
	@Prop() tooltip: string | null = null;
	/** (Optional) Whether or not to show the tooltip automatically */
	@Prop() autoShowTooltip: boolean = false;

	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}

	render() {
		return (
			<span class="action-button">
				<amplify-tooltip
					text={this.tooltip}
					shouldAutoShow={this.autoShowTooltip}
				>
					<button>
						<amplify-icon name={this.name} />
					</button>
				</amplify-tooltip>
			</span>
		);
	}
}
