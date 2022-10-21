import { Component, Prop, h, FunctionalComponent } from '@stencil/core';
import { TextFieldTypes } from '../../common/types/ui-types';

/**
 * @slot input - Content for the input within the form field
 */
@Component({
	tag: 'amplify-form-field',
	styleUrl: 'amplify-form-field.scss',
})
export class AmplifyFormField {
	/** The ID of the field. Should match with its corresponding input's ID. */
	@Prop() fieldId: string;
	/** The text of the label. Goes above the input. Ex: 'First name' */
	@Prop() label: string | null;
	/** The text of the description.  Goes between the label and the input. */
	@Prop() description: string | null;
	/** The text of a hint to the user as to how to fill out the input. Goes just below the input. */
	@Prop() hint: string | FunctionalComponent | null;
	/** The input type.  Can be any HTML input type. */
	@Prop() type?: TextFieldTypes = 'text';
	/** The required flag in order to make an input required prior to submitting a form */
	@Prop() required: boolean = false;
	/** The callback, called when the input is modified by the user. */
	@Prop() handleInputChange?: (inputEvent: Event) => void;
	/** (Optional) The placeholder for the input element.  Using hints is recommended, but placeholders can also be useful to convey information to users. */
	@Prop() placeholder?: string = '';
	/** (Optional) String value for the name of the input. */
	@Prop() name?: string;
	/** The value of the content inside of the input field */
	@Prop() value: string;
	/** Attributes places on the input element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes */
	@Prop() inputProps?: object;
	/** Will disable the input if set to true */
	@Prop() disabled?: boolean;

	render() {
		return (
			<div class="form-field">
				{this.label && (
					<div class="form-field-label">
						<amplify-label htmlFor={this.fieldId}>{this.label}</amplify-label>
					</div>
				)}
				{this.description && (
					<div
						id={`${this.fieldId}-description`}
						class="form-field-description"
						data-test="form-field-description"
					>
						{this.description}
					</div>
				)}
				<div>
					<slot name="input">
						<amplify-input
							fieldId={this.fieldId}
							description={this.description}
							type={this.type}
							handleInputChange={this.handleInputChange}
							placeholder={this.placeholder}
							name={this.name}
							value={this.value}
							inputProps={this.inputProps}
							disabled={this.disabled}
							required={this.required}
						/>
					</slot>
				</div>
				{this.hint && (
					<amplify-hint id={`${this.fieldId}-hint`}>{this.hint}</amplify-hint>
				)}
			</div>
		);
	}
}
