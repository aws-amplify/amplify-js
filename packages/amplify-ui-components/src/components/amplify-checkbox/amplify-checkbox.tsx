import { Component, Prop, h } from '@stencil/core';

@Component({
	tag: 'amplify-checkbox',
	styleUrl: 'amplify-checkbox.scss',
	shadow: true,
})
export class AmplifyCheckbox {
	/** Name of the checkbox */
	@Prop() name?: string;
	/** Value of the checkbox */
	@Prop() value?: string;
	/** Field ID used for the 'htmlFor' in the label */
	@Prop() fieldId: string;
	/** Label for the checkbox */
	@Prop() label: string;
	/** If `true`, the checkbox is selected. */
	@Prop() checked: boolean = false;
	/** If `true`, the checkbox is disabled */
	@Prop() disabled: boolean = false;

	private onClick = () => {
		this.checked = !this.checked;
	};

	render() {
		return (
			<span class="checkbox">
				<input
					onClick={this.onClick}
					type="checkbox"
					name={this.name}
					value={this.value}
					id={this.fieldId}
					checked={this.checked}
					disabled={this.disabled}
				/>
				<amplify-label htmlFor={this.fieldId}>{this.label}</amplify-label>
			</span>
		);
	}
}
