import { I18n } from '@aws-amplify/core';
import { Component, Prop, FunctionalComponent, h } from '@stencil/core';
import { Translations } from '../../common/Translations';
import { PHONE_SUFFIX } from '../../common/constants';

@Component({
	tag: 'amplify-phone-field',
	styleUrl: 'amplify-phone-field.scss',
})
export class AmplifyPhoneField {
	/** Based on the type of field e.g. sign in, sign up, forgot password, etc. */
	@Prop() fieldId: string = PHONE_SUFFIX;
	/** Used for the Phone label */
	@Prop() label: string = Translations.PHONE_LABEL;
	/** Used for the placeholder label */
	@Prop() placeholder: string = Translations.PHONE_PLACEHOLDER;
	/** Used as the hint in case you forgot your confirmation code, etc. */
	@Prop() hint: string | FunctionalComponent | null;
	/** The required flag in order to make an input required prior to submitting a form */
	@Prop() required: boolean = false;
	/** The callback, called when the input is modified by the user. */
	@Prop() handleInputChange?: (inputEvent: Event) => void;
	/** The value of the content inside of the input field */
	@Prop() value: string;
	/** Attributes places on the input element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes */
	@Prop() inputProps?: object;
	/** Will disable the input if set to true */
	@Prop() disabled?: boolean;
	/** Default dial code in the phone field */
	@Prop() dialCode?: string | number;

	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}

	render() {
		return (
			<div>
				<amplify-form-field label={I18n.get(this.label)} hint={this.hint}>
					<div class="phone-field" slot="input">
						<amplify-country-dial-code
							dialCode={this.dialCode}
							handleInputChange={this.handleInputChange}
						/>
						<amplify-input
							fieldId={this.fieldId}
							type="tel"
							handleInputChange={this.handleInputChange}
							placeholder={I18n.get(this.placeholder)}
							name={this.fieldId}
							value={this.value}
							inputProps={this.inputProps}
							disabled={this.disabled}
							required={this.required}
						/>
					</div>
				</amplify-form-field>
			</div>
		);
	}
}
