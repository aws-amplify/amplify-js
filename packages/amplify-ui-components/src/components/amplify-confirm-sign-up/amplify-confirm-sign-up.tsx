import { I18n } from '@aws-amplify/core';
import { Component, Prop, h, State, Watch, Host } from '@stencil/core';
import {
	FormFieldTypes,
	FormFieldType,
	PhoneNumberInterface,
	PhoneFormFieldType,
} from '../amplify-auth-fields/amplify-auth-fields-interface';
import {
	NO_AUTH_MODULE_FOUND,
	COUNTRY_DIAL_CODE_DEFAULT,
} from '../../common/constants';
import { Translations } from '../../common/Translations';
import {
	AuthState,
	CognitoUserInterface,
	AuthStateHandler,
	UsernameAliasStrings,
	SignUpAttributes,
} from '../../common/types/auth-types';

import { Auth } from '@aws-amplify/auth';
import {
	dispatchToastHubEvent,
	dispatchAuthStateChangeEvent,
	checkUsernameAlias,
	isHintValid,
	composePhoneNumberInput,
	handlePhoneNumberChange,
} from '../../common/helpers';
import { handleSignIn } from '../../common/auth-helpers';

@Component({
	tag: 'amplify-confirm-sign-up',
	shadow: true,
})
export class AmplifyConfirmSignUp {
	/** Fires when sign up form is submitted */
	@Prop() handleSubmit: (submitEvent: Event) => void = event =>
		this.confirmSignUp(event);
	/** Used for header text in confirm sign up component */
	@Prop() headerText: string = Translations.CONFIRM_SIGN_UP_HEADER_TEXT;
	/** Used for the submit button text in confirm sign up component */
	@Prop() submitButtonText: string =
		Translations.CONFIRM_SIGN_UP_SUBMIT_BUTTON_TEXT;
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
	/** Auth state change handler for this components
	 * e.g. SignIn -> 'Create Account' link -> SignUp
	 */
	@Prop()
	handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;
	/** Used for the username to be passed to resend code */
	@Prop() user: CognitoUserInterface;
	/** Username Alias is used to setup authentication with `username`, `email` or `phone_number`  */
	@Prop() usernameAlias: UsernameAliasStrings = 'username';

	@State() code: string;
	@State() loading: boolean = false;
	@State() userInput: string;

	private _signUpAttrs: SignUpAttributes;
	private newFormFields: FormFieldTypes | string[] = [];
	private phoneNumber: PhoneNumberInterface = {
		countryDialCodeValue: COUNTRY_DIAL_CODE_DEFAULT,
		phoneNumberValue: null,
	};

	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);

		this.setup();
	}

	@Watch('formFields')
	formFieldsHandler() {
		this.buildFormFields();
	}

	@Watch('user')
	userHandler() {
		this.setup();
	}

	private setup() {
		// TODO: Use optional chaining instead
		this.userInput = this.user && this.user.username;
		this._signUpAttrs = this.user && this.user.signUpAttrs;
		checkUsernameAlias(this.usernameAlias);
		this.buildFormFields();
	}

	private buildDefaultFormFields() {
		this.newFormFields = [
			{
				type: `${this.usernameAlias}`,
				required: true,
				handleInputChange: this.handleFormFieldInputChange(
					`${this.usernameAlias}`
				),
				value: this.userInput,
				disabled: this.userInput ? true : false,
				inputProps: { autocomplete: 'username' },
			},
			{
				type: 'code',
				label: I18n.get(Translations.CONFIRM_SIGN_UP_CODE_LABEL),
				placeholder: I18n.get(Translations.CONFIRM_SIGN_UP_CODE_PLACEHOLDER),
				required: true,
				hint: (
					<div>
						{I18n.get(Translations.CONFIRM_SIGN_UP_LOST_CODE)}{' '}
						<amplify-button
							variant="anchor"
							onClick={() => this.resendConfirmCode()}
						>
							{I18n.get(Translations.CONFIRM_SIGN_UP_RESEND_CODE)}
						</amplify-button>
					</div>
				),
				handleInputChange: this.handleFormFieldInputChange('code'),
			},
		];
	}

	private buildFormFields() {
		if (this.formFields.length === 0) {
			this.buildDefaultFormFields();
		} else {
			const newFields = [];
			this.formFields.forEach(field => {
				const newField = { ...field };
				if (newField.type === 'code') {
					newField['hint'] = isHintValid(newField) ? (
						<div>
							{I18n.get(Translations.CONFIRM_SIGN_UP_LOST_CODE)}{' '}
							<amplify-button
								variant="anchor"
								onClick={() => this.resendConfirmCode()}
							>
								{I18n.get(Translations.CONFIRM_SIGN_UP_RESEND_CODE)}
							</amplify-button>
						</div>
					) : (
						newField['hint']
					);
				}
				newField['handleInputChange'] = event =>
					this.handleFormFieldInputWithCallback(event, field);
				newFields.push(newField);
			});
			this.newFormFields = newFields;
		}
	}

	private handleFormFieldInputChange(fieldType) {
		switch (fieldType) {
			case 'username':
			case 'email':
				return event => (this.userInput = event.target.value);
			case 'phone_number':
				return event => handlePhoneNumberChange(event, this.phoneNumber);
			case 'code':
				return event => (this.code = event.target.value);
			default:
				return;
		}
	}

	setFieldValue(field: PhoneFormFieldType | FormFieldType) {
		switch (field.type) {
			case 'username':
			case 'email':
				if (field.value === undefined) {
					this.userInput = '';
				} else {
					this.userInput = field.value;
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

	/**
	 * Returns the username of the user to confirm. If a valid `user.username` has been passed as a prop, we return that.
	 * Otherwise, we return the `userInput` on the form.
	 */
	private getUsername(): string {
		if (this.user && this.user.username) return this.user.username;
		switch (this.usernameAlias) {
			case 'username':
			case 'email':
				return this.userInput;
			case 'phone_number':
				return composePhoneNumberInput(this.phoneNumber);
		}
	}

	private async resendConfirmCode() {
		if (event) {
			event.preventDefault();
		}
		if (!Auth || typeof Auth.resendSignUp !== 'function') {
			throw new Error(NO_AUTH_MODULE_FOUND);
		}
		try {
			const username = this.getUsername();
			if (!username) throw new Error(Translations.EMPTY_USERNAME);
			await Auth.resendSignUp(username.trim());
		} catch (error) {
			dispatchToastHubEvent(error);
		}
	}

	// TODO: Add validation
	// TODO: Prefix
	private async confirmSignUp(event: Event) {
		if (event) {
			event.preventDefault();
		}
		if (!Auth || typeof Auth.confirmSignUp !== 'function') {
			throw new Error(NO_AUTH_MODULE_FOUND);
		}

		this.loading = true;

		try {
			let username = this.getUsername();
			if (!username) throw new Error(Translations.EMPTY_USERNAME);
			username = username.trim();

			const confirmSignUpResult = await Auth.confirmSignUp(username, this.code);

			if (!confirmSignUpResult) {
				throw new Error(I18n.get(Translations.CONFIRM_SIGN_UP_FAILED));
			}
			if (
				this._signUpAttrs &&
				this._signUpAttrs.password &&
				this._signUpAttrs.password !== ''
			) {
				// Auto sign in user if password is available from previous workflow
				await handleSignIn(
					username,
					this._signUpAttrs.password,
					this.handleAuthStateChange
				);
			} else {
				this.handleAuthStateChange(AuthState.SignIn);
			}
		} catch (error) {
			dispatchToastHubEvent(error);
		} finally {
			this.loading = false;
		}
	}

	render() {
		return (
			<Host>
				<amplify-form-section
					headerText={I18n.get(this.headerText)}
					submitButtonText={I18n.get(this.submitButtonText)}
					handleSubmit={this.handleSubmit}
					loading={this.loading}
					secondaryFooterContent={
						<div>
							<span>
								<amplify-button
									variant="anchor"
									onClick={() => this.handleAuthStateChange(AuthState.SignIn)}
								>
									{I18n.get(Translations.BACK_TO_SIGN_IN)}
								</amplify-button>
							</span>
						</div>
					}
				>
					<amplify-auth-fields formFields={this.newFormFields} />
				</amplify-form-section>
			</Host>
		);
	}
}
