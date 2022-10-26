import { Component, Prop, h } from '@stencil/core';

@Component({
	tag: 'amplify-radio-button',
	styleUrl: 'amplify-radio-button.scss',
})
export class AmplifyRadioButton {
	/** The callback, called when the input is modified by the user. */
	@Prop() handleInputChange?: (inputEvent: Event) => void;
	/** (Optional) Name of radio button */
	@Prop() name?: string;
	/** (Optional) Value of radio button */
	@Prop() value?: string;
	/** (Optional) The placeholder for the input element.  Using hints is recommended, but placeholders can also be useful to convey information to users. */
	@Prop() placeholder?: string = '';
	/** Field ID used for the 'for' in the label */
	@Prop() fieldId: string;
	/** Label for the radio button */
	@Prop() label: string;
	/** If `true`, the radio button is selected. */
	@Prop() checked: boolean = false;
	/** If `true`, the checkbox is disabled */
	@Prop() disabled: boolean = false;
	/** Attributes places on the input element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes */
	@Prop() inputProps?: object;

	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}

	render() {
		return (
			<span class="radio-button">
				<input
					type="radio"
					name={this.name}
					value={this.value}
					onInput={this.handleInputChange}
					placeholder={this.placeholder}
					id={this.fieldId}
					checked={this.checked}
					disabled={this.disabled}
					{...this.inputProps}
				/>
				<amplify-label htmlFor={this.fieldId}>{this.label}</amplify-label>
			</span>
		);
	}
}
