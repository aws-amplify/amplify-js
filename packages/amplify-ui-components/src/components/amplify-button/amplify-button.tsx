import { Element, Component, Prop, h, Host } from '@stencil/core';
import { ButtonTypes, ButtonVariant } from '../../common/types/ui-types';
import { IconNameType } from '../amplify-icon/icons';

/**
 * @slot (default) - content placed within the button
 */
@Component({
	tag: 'amplify-button',
	styleUrl: 'amplify-button.scss',
})
export class AmplifyButton {
	@Element() el!: HTMLAmplifyButtonElement;
	/** Type of the button: 'button', 'submit' or 'reset' */
	@Prop() type: ButtonTypes = 'button';
	/** Variant of a button: 'button' | 'anchor | 'icon' */
	@Prop() variant: ButtonVariant = 'button';
	/** (Optional) Callback called when a user clicks on the button */
	@Prop() handleButtonClick: (evt: Event) => void;
	/** Disabled state of the button */
	@Prop() disabled?: boolean = false;
	/** Name of icon to be placed inside the button */
	@Prop() icon?: IconNameType;

	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}

	render() {
		return (
			<Host>
				<button
					class={{
						[this.variant]: true,
					}}
					type={this.type}
					disabled={this.disabled}
					onClick={this.handleButtonClick}
				>
					{this.variant === 'icon' && (
						<amplify-icon name={this.icon}></amplify-icon>
					)}
					<slot />
				</button>
			</Host>
		);
	}
}
