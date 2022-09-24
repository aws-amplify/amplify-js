import { I18n } from '@aws-amplify/core';
import { Component, Prop, FunctionalComponent, h } from '@stencil/core';
import { USERNAME_SUFFIX } from '../../common/constants';
import { Translations } from '../../common/Translations';

@Component({
	tag: 'amplify-username-field',
})
export class AmplifyUsernameField {
	/** Based on the type of field e.g. sign in, sign up, forgot password, etc. */
	@Prop() fieldId: string = USERNAME_SUFFIX;
	/** Used for the username label */
	@Prop() label: string = Translations.USERNAME_LABEL;
	/** Used for the placeholder label */
	@Prop() placeholder: string = Translations.USERNAME_PLACEHOLDER;
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
	/** Used for the hint text that displays underneath the input field */
	@Prop() hint?: string | FunctionalComponent | null;

	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}

	render() {
		return (
			<amplify-form-field
				name="username"
				fieldId={this.fieldId}
				label={I18n.get(this.label)}
				placeholder={I18n.get(this.placeholder)}
				required={this.required}
				handleInputChange={this.handleInputChange}
				value={this.value}
				inputProps={this.inputProps}
				disabled={this.disabled}
				hint={this.hint}
			/>
		);
	}
}
