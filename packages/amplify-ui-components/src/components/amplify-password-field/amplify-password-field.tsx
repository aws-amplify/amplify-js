import { I18n } from '@aws-amplify/core';
import { Component, Prop, FunctionalComponent, h } from '@stencil/core';
import { PASSWORD_SUFFIX } from '../../common/constants';
import { Translations } from '../../common/Translations';

@Component({
	tag: 'amplify-password-field',
})
export class AmplifyPasswordField {
	/** Based on the type of field e.g. sign in, sign up, forgot password, etc. */
	@Prop() fieldId: string = PASSWORD_SUFFIX;
	/** Used for the password label */
	@Prop() label: string = Translations.PASSWORD_LABEL;
	/** Used for the placeholder label */
	@Prop() placeholder: string = Translations.PASSWORD_PLACEHOLDER;
	/** Used as the hint in case you forgot your password, etc. */
	@Prop() hint: string | FunctionalComponent | null;
	/** The required flag in order to make an input required prior to submitting a form */
	@Prop() required: boolean = false;
	/** The callback, called when the input is modified by the user. */
	@Prop() handleInputChange?: (inputEvent: Event) => void;
	/** The value of the content inside of the input field */
	@Prop() value?: string;
	/** Attributes places on the input element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes */
	@Prop() inputProps?: object;
	/** Will disable the input if set to true */
	@Prop() disabled?: boolean;

	render() {
		return (
			<amplify-form-field
				type="password"
				name="password"
				fieldId={this.fieldId}
				label={I18n.get(this.label)}
				placeholder={I18n.get(this.placeholder)}
				hint={this.hint}
				required={this.required}
				handleInputChange={this.handleInputChange}
				value={this.value}
				inputProps={this.inputProps}
				disabled={this.disabled}
			/>
		);
	}
}
