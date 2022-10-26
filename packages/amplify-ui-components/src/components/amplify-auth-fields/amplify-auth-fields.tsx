import { Component, Prop, h } from '@stencil/core';
import { FormFieldType, FormFieldTypes } from './amplify-auth-fields-interface';
import componentFieldMapping from './component-field-mapping';

@Component({
	tag: 'amplify-auth-fields',
	styleUrl: 'amplify-auth-fields.scss',
})
export class AmplifyAuthFields {
	/**
	 * Form fields allows you to utilize our pre-built components such as username field, code field, password field, email field, etc.
	 * by passing an array of strings that you would like the order of the form to be in. If you need more customization, such as changing
	 * text for a label or adjust a placeholder, you can follow the structure below in order to do just that.
	 * ```
	 * [
	 *  {
	 *    type: string,
	 *    label: string,
	 *    placeholder: string,
	 *    hint: string | Functional Component | null,
	 *    required: boolean
	 *  }
	 * ]
	 * ```
	 */
	@Prop() formFields: FormFieldTypes | string[];

	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}

	private constructFormFieldOptions(formFields: FormFieldTypes | string[]) {
		const content = [];

		if (formFields === undefined) return '';

		formFields.forEach((formField: FormFieldType | string) => {
			if (typeof formField === 'string') {
				content.push(componentFieldMapping[formField](formField));
			} else if (Object.keys(componentFieldMapping).includes(formField.type)) {
				content.push(componentFieldMapping[formField.type](formField));
			} else {
				content.push(componentFieldMapping['default'](formField));
			}
		});

		return content;
	}

	render() {
		return (
			<div class="auth-fields">
				{this.constructFormFieldOptions(this.formFields)}
			</div>
		);
	}
}
