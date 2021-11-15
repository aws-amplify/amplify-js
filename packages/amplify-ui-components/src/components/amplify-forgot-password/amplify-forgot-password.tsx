import { Auth } from '@aws-amplify/auth';
import { I18n, Logger } from '@aws-amplify/core';
import { Component, Prop, State, h, Watch, Host } from '@stencil/core';

import {
	FormFieldTypes,
	FormFieldType,
	PhoneNumberInterface,
	PhoneFormFieldType,
} from '../amplify-auth-fields/amplify-auth-fields-interface';
import {
	AuthState,
	AuthStateHandler,
	UsernameAliasStrings,
} from '../../common/types/auth-types';
import {
	NO_AUTH_MODULE_FOUND,
	COUNTRY_DIAL_CODE_DEFAULT,
} from '../../common/constants';
import { Translations } from '../../common/Translations';
import {
	CodeDeliveryType,
	ForgotPasswordAttributes,
} from './amplify-forgot-password-interface';

import {
	dispatchToastHubEvent,
	dispatchAuthStateChangeEvent,
	composePhoneNumberInput,
	checkUsernameAlias,
	handlePhoneNumberChange,
} from '../../common/helpers';

const logger = new Logger('ForgotPassword');

@Component({
	tag: 'amplify-forgot-password',
	shadow: true,
})
export class AmplifyForgotPassword {
	/** The header text of the forgot password section */
	@Prop() headerText: string = Translations.RESET_YOUR_PASSWORD;
	/** The text displayed inside of the send code button for the form */
	@Prop() sendButtonText: string = Translations.SEND_CODE;
	/** The text displayed inside of the submit button for the form */
	@Prop() submitButtonText: string = Translations.SUBMIT;
	/** The form fields displayed inside of the forgot password form */
	@Prop() formFields: FormFieldTypes | string[] = [];
	/** The function called when making a request to reset password */
	@Prop() handleSend: (event: Event) => void = (event) => this.send(event);
	/** The function called when submitting a new password */
	@Prop() handleSubmit: (event: Event) => void = (event) => this.submit(event);
	/** Auth state change handler for this component */
	@Prop()
	handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;
	/** Username Alias is used to setup authentication with `username`, `email` or `phone_number`  */
	@Prop() usernameAlias: UsernameAliasStrings = 'username';
	@State() delivery: CodeDeliveryType | null = null;
	@State() loading: boolean = false;

	private phoneNumber: PhoneNumberInterface = {
		countryDialCodeValue: COUNTRY_DIAL_CODE_DEFAULT,
		phoneNumberValue: null,
	};
	private newFormFields: FormFieldTypes | string[] = [];

	@State() forgotPasswordAttrs: ForgotPasswordAttributes = {
		userInput: '',
		password: '',
		code: '',
	};

	componentWillLoad() {
		checkUsernameAlias(this.usernameAlias);
		this.buildFormFields();
	}

	@Watch('formFields')
	formFieldsHandler() {
		this.buildFormFields();
	}

	private buildFormFields() {
		if (this.formFields.length === 0) {
			this.buildDefaultFormFields();
		} else {
			const newFields = [];
			this.formFields.forEach((field) => {
				const newField = { ...field };
				newField['handleInputChange'] = (event) =>
					this.handleFormFieldInputWithCallback(event, field);
				newFields.push(newField);
			});
			this.newFormFields = newFields;
		}
	}

	private buildDefaultFormFields() {
		switch (this.usernameAlias) {
			case 'email':
				this.newFormFields = [
					{
						type: 'email',
						required: true,
						handleInputChange: this.handleFormFieldInputChange('email'),
						inputProps: {
							'data-test': 'forgot-password-email-input',
						},
					},
				];
				break;
			case 'phone_number':
				this.newFormFields = [
					{
						type: 'phone_number',
						required: true,
						handleInputChange: this.handleFormFieldInputChange('phone_number'),
						inputProps: {
							'data-test': 'forgot-password-phone-number-input',
						},
					},
				];
				break;
			case 'username':
			default:
				this.newFormFields = [
					{
						type: 'username',
						required: true,
						handleInputChange: this.handleFormFieldInputChange('username'),
						inputProps: {
							'data-test': 'forgot-password-username-input',
						},
					},
				];
				break;
		}
	}

	private handleFormFieldInputChange(fieldType) {
		switch (fieldType) {
			case 'username':
			case 'email':
				return (event) =>
					(this.forgotPasswordAttrs.userInput = event.target.value);
			case 'phone_number':
				return (event) => handlePhoneNumberChange(event, this.phoneNumber);
			case 'password':
			case 'code':
				return (event) =>
					(this.forgotPasswordAttrs[fieldType] = event.target.value);
			default:
				return;
		}
	}

	setFieldValue(
		field: PhoneFormFieldType | FormFieldType,
		formAttributes: ForgotPasswordAttributes
	) {
		switch (field.type) {
			case 'username':
			case 'email':
				if (field.value === undefined) {
					formAttributes.userInput = '';
				} else {
					formAttributes.userInput = field.value;
				}
				break;
			case 'phone_number':
				if ((field as PhoneFormFieldType).dialCode) {
					this.phoneNumber.countryDialCodeValue = (
						field as PhoneFormFieldType
					).dialCode;
				}
				this.phoneNumber.phoneNumberValue = field.value;
				break;
			case 'password':
			case 'code':
				if (field.value === undefined) {
					formAttributes[field.type] = '';
				} else {
					formAttributes[field.type] = field.value;
				}
				break;
		}
	}

	private handleFormFieldInputWithCallback(event, field) {
		const fnToCall = field['handleInputChange']
			? field['handleInputChange']
			: (event, cb) => {
					cb(event);
			  };
		const callback = this.handleFormFieldInputChange(field.type);
		fnToCall(event, callback.bind(this));
	}

	private async send(event) {
		if (event) {
			event.preventDefault();
		}
		if (!Auth || typeof Auth.forgotPassword !== 'function') {
			throw new Error(NO_AUTH_MODULE_FOUND);
		}
		this.loading = true;

		switch (this.usernameAlias) {
			case 'phone_number':
				try {
					this.forgotPasswordAttrs.userInput = composePhoneNumberInput(
						this.phoneNumber
					);
				} catch (error) {
					dispatchToastHubEvent(error);
				}
				break;
			default:
				break;
		}

		try {
			const data = await Auth.forgotPassword(
				this.forgotPasswordAttrs.userInput.trim()
			);
			logger.debug(data);
			this.newFormFields = [
				{
					type: 'code',
					required: true,
					handleInputChange: this.handleFormFieldInputChange('code'),
					inputProps: {
						'data-test': 'forgot-password-code-input',
					},
				},
				{
					type: 'password',
					required: true,
					handleInputChange: this.handleFormFieldInputChange('password'),
					label: I18n.get(Translations.NEW_PASSWORD_LABEL),
					placeholder: I18n.get(Translations.NEW_PASSWORD_PLACEHOLDER),
				},
			];
			this.delivery = data.CodeDeliveryDetails;
		} catch (error) {
			dispatchToastHubEvent(error);
		} finally {
			this.loading = false;
		}
	}

	private async submit(event: Event) {
		if (event) {
			event.preventDefault();
		}
		if (!Auth || typeof Auth.forgotPasswordSubmit !== 'function') {
			throw new Error(NO_AUTH_MODULE_FOUND);
		}
		this.loading = true;
		try {
			const { userInput, code, password } = this.forgotPasswordAttrs;
			const data = await Auth.forgotPasswordSubmit(
				userInput.trim(),
				code,
				password
			);
			logger.debug(data);
			this.handleAuthStateChange(AuthState.SignIn);
			this.delivery = null;
		} catch (error) {
			dispatchToastHubEvent(error);
		} finally {
			this.loading = false;
		}
	}

	render() {
		const submitFn = this.delivery
			? (event) => this.handleSubmit(event)
			: (event) => this.handleSend(event);
		const submitButtonText = this.delivery
			? this.submitButtonText
			: this.sendButtonText;
		return (
			<Host>
				<amplify-form-section
					headerText={I18n.get(this.headerText)}
					handleSubmit={submitFn}
					loading={this.loading}
					secondaryFooterContent={
						<amplify-button
							variant="anchor"
							onClick={() => this.handleAuthStateChange(AuthState.SignIn)}
							data-test="forgot-password-back-to-sign-in-link"
						>
							{I18n.get(Translations.BACK_TO_SIGN_IN)}
						</amplify-button>
					}
					testDataPrefix={'forgot-password'}
					submitButtonText={I18n.get(submitButtonText)}
				>
					<amplify-auth-fields formFields={this.newFormFields} />
				</amplify-form-section>
			</Host>
		);
	}
}
