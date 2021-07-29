import { h } from '@stencil/core';
import {
	FormFieldType,
	PhoneFormFieldType,
} from './amplify-auth-fields-interface';
import { TextFieldTypes } from '../../common/types/ui-types';

const componentFieldMapping = {
	username: (ff: FormFieldType) => (
		<amplify-username-field
			label={ff.label}
			placeholder={ff.placeholder}
			required={ff.required}
			handleInputChange={ff.handleInputChange}
			value={ff.value}
			inputProps={ff.inputProps}
			disabled={ff.disabled}
			hint={ff.hint}
		/>
	),
	password: (ff: FormFieldType) => (
		<amplify-password-field
			label={ff.label}
			placeholder={ff.placeholder}
			hint={ff.hint}
			required={ff.required}
			handleInputChange={ff.handleInputChange}
			value={ff.value}
			inputProps={ff.inputProps}
			disabled={ff.disabled}
		/>
	),
	email: (ff: FormFieldType) => (
		<amplify-email-field
			label={ff.label}
			placeholder={ff.placeholder}
			required={ff.required}
			handleInputChange={ff.handleInputChange}
			value={ff.value}
			inputProps={ff.inputProps}
			disabled={ff.disabled}
			hint={ff.hint}
		/>
	),
	code: (ff: FormFieldType) => (
		<amplify-code-field
			label={ff.label}
			placeholder={ff.placeholder}
			hint={ff.hint}
			required={ff.required}
			handleInputChange={ff.handleInputChange}
			value={ff.value}
			inputProps={{ ...ff.inputProps, min: '0' }}
			disabled={ff.disabled}
		/>
	),
	// TODO: Will create a phone field component once the dial country code component is in
	phone_number: (ff: PhoneFormFieldType) => (
		<amplify-phone-field
			label={ff.label}
			placeholder={ff.placeholder}
			required={ff.required}
			handleInputChange={ff.handleInputChange}
			value={ff.value}
			inputProps={ff.inputProps}
			disabled={ff.disabled}
			dialCode={ff.dialCode}
			hint={ff.hint}
		/>
	),
	default: (ff: FormFieldType) => (
		<amplify-form-field
			label={ff.label}
			type={ff.type as TextFieldTypes}
			placeholder={ff.placeholder}
			required={ff.required}
			handleInputChange={ff.handleInputChange}
			value={ff.value}
			inputProps={ff.inputProps}
			disabled={ff.disabled}
			hint={ff.hint}
		/>
	),
};

export default componentFieldMapping;
