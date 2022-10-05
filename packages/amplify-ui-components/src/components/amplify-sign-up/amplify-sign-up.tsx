import { I18n } from '@aws-amplify/core';
import { Auth, SignUpParams } from '@aws-amplify/auth';
import { ISignUpResult } from 'amazon-cognito-identity-js';
import { Component, Prop, h, State, Watch, Host } from '@stencil/core';
import {
	FormFieldTypes,
	PhoneNumberInterface,
	FormFieldType,
	PhoneFormFieldType,
} from '../../components/amplify-auth-fields/amplify-auth-fields-interface';
import {
	COUNTRY_DIAL_CODE_DEFAULT,
	NO_AUTH_MODULE_FOUND,
} from '../../common/constants';
import {
	AuthState,
	AuthStateHandler,
	UsernameAlias,
	UsernameAliasStrings,
} from '../../common/types/auth-types';
import { SignUpAttributes } from '../../common/types/auth-types';
import {
	dispatchAuthStateChangeEvent,
	dispatchToastHubEvent,
	composePhoneNumberInput,
	checkUsernameAlias,
	handlePhoneNumberChange,
} from '../../common/helpers';
import { Translations } from '../../common/Translations';
import { handleSignIn } from '../../common/auth-helpers';

/**
 * @slot header-subtitle - Subtitle content placed below header text
 * @slot footer - Content placed in the footer of the component
 * @slot primary-footer-content - Content placed on the right side of the footer
 * @slot secondary-footer-content - Content placed on the left side of the footer
 */
@Component({
	tag: 'amplify-sign-up',
	styleUrl: 'amplify-sign-up.scss',
	shadow: true,
})
export class AmplifySignUp {
	/** Fires when sign up form is submitted */
	@Prop() handleSubmit: (event: Event) => void = event => this.signUp(event);
	/** Override for handling the Auth.SignUp API call */
	@Prop() handleSignUp: (params: SignUpParams) => Promise<ISignUpResult> =
		params => this.authSignUp(params);
	/** Engages when invalid actions occur, such as missing field, etc. */
	@Prop() validationErrors: string;
	/** Used for header text in sign up component */
	@Prop() headerText: string = Translations.SIGN_UP_HEADER_TEXT;
	/** Used for the submit button text in sign up component */
	@Prop() submitButtonText: string = Translations.SIGN_UP_SUBMIT_BUTTON_TEXT;
	/** Used for the submit button text in sign up component */
	@Prop() haveAccountText: string = Translations.SIGN_UP_HAVE_ACCOUNT_TEXT;
	/** Text used for the sign in hyperlink */
	@Prop() signInText: string = Translations.SIGN_IN_TEXT;
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
	@Prop() formFields: FormFieldTypes | string[] = [];
	/** Auth state change handler for this component
	 * e.g. SignIn -> 'Create Account' link -> SignUp
	 */
	// prettier-ignore
	@Prop() handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;
	/** Username Alias is used to setup authentication with `username`, `email` or `phone_number`  */
	@Prop() usernameAlias: UsernameAliasStrings = 'username';
	// private userInput: string | PhoneNumberInterface;
	private newFormFields: FormFieldTypes | string[] = [];
	private phoneNumber: PhoneNumberInterface = {
		countryDialCodeValue: COUNTRY_DIAL_CODE_DEFAULT,
		phoneNumberValue: null,
	};

	@State() loading: boolean = false;
	@State() signUpAttributes: SignUpAttributes = {
		username: '',
		password: '',
		attributes: {},
	};

	private handleFormFieldInputChange(fieldType) {
		switch (fieldType) {
			case 'username':
				return event => (this.signUpAttributes.username = event.target.value);
			case 'password':
				return event => (this.signUpAttributes.password = event.target.value);
			case 'email':
				return event =>
					(this.signUpAttributes.attributes.email = event.target.value);
			case 'phone_number':
				return event => handlePhoneNumberChange(event, this.phoneNumber);
			default:
				return event =>
					(this.signUpAttributes.attributes[fieldType] = event.target.value);
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

	private async authSignUp(params: SignUpParams): Promise<ISignUpResult> {
		const data = await Auth.signUp(params);
		if (!data) {
			throw new Error(Translations.SIGN_UP_FAILED);
		}

		return data;
	}

	private assignPhoneNumberToSignUpAttributes(): void {
		if (this.phoneNumber.phoneNumberValue) {
			try {
				this.signUpAttributes.attributes.phone_number = composePhoneNumberInput(
					this.phoneNumber
				);
			} catch (error) {
				dispatchToastHubEvent(error);
			}
		}
	}

	private assignUserNameAliasToSignUpAttributes(): void {
		switch (this.usernameAlias) {
			case 'email':
			case 'phone_number':
				this.signUpAttributes.username =
					this.signUpAttributes.attributes[this.usernameAlias];
				break;
			case 'username':
			default:
				break;
		}
	}

	private assignFormInputToSignUpAttributes(): void {
		this.assignPhoneNumberToSignUpAttributes();
		this.assignUserNameAliasToSignUpAttributes();
	}

	private validateSignUpAttributes(): void {
		if (!this.signUpAttributes.username) {
			if (this.usernameAlias === UsernameAlias.email) {
				throw new Error(Translations.EMPTY_EMAIL);
			} else if (this.usernameAlias === UsernameAlias.phone_number) {
				throw new Error(Translations.EMPTY_PHONE);
			} else {
				throw new Error(Translations.EMPTY_USERNAME);
			}
		}
		if (this.signUpAttributes.username.indexOf(' ') >= 0) {
			throw new Error(Translations.USERNAME_REMOVE_WHITESPACE);
		}
		if (
			this.signUpAttributes.password !== this.signUpAttributes.password.trim()
		) {
			throw new Error(Translations.PASSWORD_REMOVE_WHITESPACE);
		}
	}

	// TODO: Add validation
	// TODO: Prefix
	private async signUp(event: Event) {
		if (event) {
			event.preventDefault();
		}
		if (!Auth || typeof Auth.signUp !== 'function') {
			throw new Error(NO_AUTH_MODULE_FOUND);
		}

		this.loading = true;
		this.assignFormInputToSignUpAttributes();

		try {
			this.validateSignUpAttributes();

			const data = await this.handleSignUp(this.signUpAttributes);
			if (data.userConfirmed) {
				await handleSignIn(
					this.signUpAttributes.username,
					this.signUpAttributes.password,
					this.handleAuthStateChange
				);
			} else {
				const signUpAttrs = { ...this.signUpAttributes };
				this.handleAuthStateChange(AuthState.ConfirmSignUp, {
					...data.user,
					signUpAttrs,
				});
			}
		} catch (error) {
			dispatchToastHubEvent(error);
		} finally {
			this.loading = false;
		}
	}

	private buildDefaultFormFields() {
		switch (this.usernameAlias) {
			case 'email':
				this.newFormFields = [
					{
						type: 'email',
						placeholder: I18n.get(Translations.SIGN_UP_EMAIL_PLACEHOLDER),
						required: true,
						handleInputChange: this.handleFormFieldInputChange('email'),
						inputProps: {
							'data-test': 'sign-up-email-input',
							autocomplete: 'username',
						},
					},
					{
						type: 'password',
						placeholder: I18n.get(Translations.SIGN_UP_PASSWORD_PLACEHOLDER),
						required: true,
						handleInputChange: this.handleFormFieldInputChange('password'),
						inputProps: {
							'data-test': 'sign-up-password-input',
							autocomplete: 'new-password',
						},
					},
					{
						type: 'phone_number',
						required: true,
						handleInputChange: this.handleFormFieldInputChange('phone_number'),
						inputProps: {
							'data-test': 'sign-up-phone-number-input',
							autocomplete: 'tel-national',
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
							'data-test': 'sign-up-phone-number-input',
							autocomplete: 'username',
						},
					},
					{
						type: 'password',
						placeholder: I18n.get(Translations.SIGN_UP_PASSWORD_PLACEHOLDER),
						required: true,
						handleInputChange: this.handleFormFieldInputChange('password'),
						inputProps: {
							'data-test': 'sign-up-password-input',
							autocomplete: 'new-password',
						},
					},
					{
						type: 'email',
						placeholder: I18n.get(Translations.SIGN_UP_EMAIL_PLACEHOLDER),
						required: true,
						handleInputChange: this.handleFormFieldInputChange('email'),
						inputProps: {
							'data-test': 'sign-up-email-input',
							autocomplete: 'email',
						},
					},
				];
				break;
			case 'username':
			default:
				this.newFormFields = [
					{
						type: 'username',
						placeholder: I18n.get(Translations.SIGN_UP_USERNAME_PLACEHOLDER),
						required: true,
						handleInputChange: this.handleFormFieldInputChange('username'),
						inputProps: {
							'data-test': 'sign-up-username-input',
							autocomplete: 'username',
						},
					},
					{
						type: 'password',
						placeholder: I18n.get(Translations.SIGN_UP_PASSWORD_PLACEHOLDER),
						required: true,
						handleInputChange: this.handleFormFieldInputChange('password'),
						inputProps: {
							'data-test': 'sign-up-password-input',
							autocomplete: 'new-password',
						},
					},
					{
						type: 'email',
						placeholder: I18n.get(Translations.SIGN_UP_EMAIL_PLACEHOLDER),
						required: true,
						handleInputChange: this.handleFormFieldInputChange('email'),
						inputProps: {
							'data-test': 'sign-up-email-input',
						},
					},
					{
						type: 'phone_number',
						required: true,
						handleInputChange: this.handleFormFieldInputChange('phone_number'),
						inputProps: {
							'data-test': 'sign-up-phone-number-input',
						},
					},
				];
				break;
		}
	}

	private buildFormFields() {
		if (this.formFields.length === 0) {
			this.buildDefaultFormFields();
		} else {
			const newFields = [];
			this.formFields.forEach(field => {
				const newField = { ...field };
				newField['handleInputChange'] = event =>
					this.handleFormFieldInputWithCallback(event, field);
				this.setFieldValue(field, this.signUpAttributes);
				newFields.push(newField);
			});
			this.newFormFields = newFields;
		}
	}

	setFieldValue(
		field: PhoneFormFieldType | FormFieldType,
		formAttributes: SignUpAttributes
	) {
		switch (field.type) {
			case 'username':
				if (field.value === undefined) {
					formAttributes.username = '';
				} else {
					formAttributes.username = field.value;
				}
				break;
			case 'password':
				if (field.value === undefined) {
					formAttributes.password = '';
				} else {
					formAttributes.password = field.value;
				}
				break;
			case 'email':
				formAttributes.attributes.email = field.value;
				break;
			case 'phone_number':
				if ((field as PhoneFormFieldType).dialCode) {
					this.phoneNumber.countryDialCodeValue = (
						field as PhoneFormFieldType
					).dialCode;
				}
				this.phoneNumber.phoneNumberValue = field.value;
				break;
			default:
				formAttributes.attributes[field.type] = field.value;
				break;
		}
	}

	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
		checkUsernameAlias(this.usernameAlias);
		this.buildFormFields();
	}

	@Watch('formFields')
	formFieldsHandler() {
		this.buildFormFields();
	}

	render() {
		return (
			<Host>
				<amplify-form-section
					headerText={I18n.get(this.headerText)}
					handleSubmit={this.handleSubmit}
					testDataPrefix={'sign-up'}
				>
					<div slot="subtitle">
						<slot name="header-subtitle"></slot>
					</div>
					<amplify-auth-fields formFields={this.newFormFields} />
					<div class="sign-up-form-footer" slot="amplify-form-section-footer">
						<slot name="footer">
							<slot name="secondary-footer-content">
								<span>
									{I18n.get(this.haveAccountText)}{' '}
									<amplify-button
										variant="anchor"
										onClick={() => this.handleAuthStateChange(AuthState.SignIn)}
										data-test="sign-up-sign-in-link"
									>
										{I18n.get(this.signInText)}
									</amplify-button>
								</span>
							</slot>
							<slot name="primary-footer-content">
								<amplify-button
									type="submit"
									data-test="sign-up-create-account-button"
									disabled={this.loading}
								>
									{this.loading ? (
										<amplify-loading-spinner />
									) : (
										<span>{I18n.get(this.submitButtonText)}</span>
									)}
								</amplify-button>
							</slot>
						</slot>
					</div>
				</amplify-form-section>
			</Host>
		);
	}
}
