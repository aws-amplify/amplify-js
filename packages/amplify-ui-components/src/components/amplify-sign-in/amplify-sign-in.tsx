import { I18n, isEmpty } from '@aws-amplify/core';
import { Component, Prop, State, h, Watch, Host } from '@stencil/core';
import {
	FormFieldTypes,
	FormFieldType,
	PhoneNumberInterface,
	PhoneFormFieldType,
} from '../../components/amplify-auth-fields/amplify-auth-fields-interface';
import {
	AuthState,
	FederatedConfig,
	AuthStateHandler,
	UsernameAliasStrings,
} from '../../common/types/auth-types';
import { Translations } from '../../common/Translations';
import { COUNTRY_DIAL_CODE_DEFAULT } from '../../common/constants';

import {
	dispatchToastHubEvent,
	dispatchAuthStateChangeEvent,
	composePhoneNumberInput,
	checkUsernameAlias,
	isHintValid,
	handlePhoneNumberChange,
} from '../../common/helpers';
import { handleSignIn } from '../../common/auth-helpers';
import { SignInAttributes } from './amplify-sign-in-interface';

/**
 * @slot header-subtitle - Subtitle content placed below header text
 * @slot federated-buttons - Content above form fields used for sign in federation buttons
 * @slot footer - Content is place in the footer of the component
 * @slot primary-footer-content - Content placed on the right side of the footer
 * @slot secondary-footer-content - Content placed on the left side of the footer
 */
@Component({
	tag: 'amplify-sign-in',
	styleUrl: 'amplify-sign-in.scss',
	shadow: true,
})
export class AmplifySignIn {
	/** Fires when sign in form is submitted */
	@Prop() handleSubmit: (event: Event) => void = event => this.signIn(event);
	/** Used for header text in sign in component */
	@Prop() headerText: string = Translations.SIGN_IN_HEADER_TEXT;
	/** Used for the submit button text in sign in component */
	@Prop() submitButtonText: string = Translations.SIGN_IN_ACTION;
	/** Federated credentials & configuration. */
	@Prop() federated: FederatedConfig;
	/** Auth state change handler for this component */
	// prettier-ignore
	@Prop() handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;
	/** Username Alias is used to setup authentication with `username`, `email` or `phone_number`  */
	@Prop() usernameAlias: UsernameAliasStrings = 'username';
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
	/** Hides the sign up link */
	@Prop() hideSignUp: boolean = false;
	private newFormFields: FormFieldTypes | string[] = [];

	/* Whether or not the sign-in component is loading */
	@State() loading: boolean = false;

	private phoneNumber: PhoneNumberInterface = {
		countryDialCodeValue: COUNTRY_DIAL_CODE_DEFAULT,
		phoneNumberValue: null,
	};

	@State() signInAttributes: SignInAttributes = {
		userInput: '',
		password: '',
	};

	componentWillLoad() {
		checkUsernameAlias(this.usernameAlias);
		this.buildFormFields();
	}

	@Watch('formFields')
	formFieldsHandler() {
		this.buildFormFields();
	}

	private handleFormFieldInputChange(fieldType) {
		switch (fieldType) {
			case 'username':
			case 'email':
				return event => (this.signInAttributes.userInput = event.target.value);
			case 'phone_number':
				return event => handlePhoneNumberChange(event, this.phoneNumber);
			case 'password':
				return event => (this.signInAttributes.password = event.target.value);
			default:
				return () => {};
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

	private async signIn(event: Event) {
		// avoid submitting the form
		if (event) {
			event.preventDefault();
		}

		this.loading = true;

		switch (this.usernameAlias) {
			case 'phone_number':
				try {
					this.signInAttributes.userInput = composePhoneNumberInput(
						this.phoneNumber
					);
				} catch (error) {
					dispatchToastHubEvent(error);
				}
			default:
				break;
		}
		const username = this.signInAttributes.userInput.trim();
		await handleSignIn(
			username,
			this.signInAttributes.password,
			this.handleAuthStateChange,
			this.usernameAlias
		);
		this.loading = false;
	}

	buildDefaultFormFields() {
		const formFieldInputs = [];
		switch (this.usernameAlias) {
			case 'email':
				formFieldInputs.push({
					type: 'email',
					required: true,
					handleInputChange: this.handleFormFieldInputChange('email'),
					inputProps: {
						'data-test': 'sign-in-email-input',
						autocomplete: 'username',
					},
				});
				break;
			case 'phone_number':
				formFieldInputs.push({
					type: 'phone_number',
					required: true,
					handleInputChange: this.handleFormFieldInputChange('phone_number'),
					inputProps: {
						'data-test': 'sign-in-phone-number-input',
						autocomplete: 'username',
					},
				});
				break;
			case 'username':
			default:
				formFieldInputs.push({
					type: 'username',
					required: true,
					handleInputChange: this.handleFormFieldInputChange('username'),
					inputProps: {
						'data-test': 'sign-in-username-input',
						autocomplete: 'username',
					},
				});
				break;
		}

		formFieldInputs.push({
			type: 'password',
			hint: (
				<div>
					{I18n.get(Translations.FORGOT_PASSWORD_TEXT)}{' '}
					<amplify-button
						variant="anchor"
						onClick={() => this.handleAuthStateChange(AuthState.ForgotPassword)}
						data-test="sign-in-forgot-password-link"
					>
						{I18n.get(Translations.RESET_PASSWORD_TEXT)}
					</amplify-button>
				</div>
			),
			required: true,
			handleInputChange: this.handleFormFieldInputChange('password'),
			inputProps: {
				'data-test': 'sign-in-password-input',
			},
		});
		this.newFormFields = [...formFieldInputs];
	}

	buildFormFields() {
		if (this.formFields.length === 0) {
			this.buildDefaultFormFields();
		} else {
			const newFields = [];
			this.formFields.forEach(field => {
				const newField = { ...field };
				// TODO: handle hint better
				if (newField.type === 'password') {
					newField['hint'] = isHintValid(newField) ? (
						<div>
							{I18n.get(Translations.FORGOT_PASSWORD_TEXT)}{' '}
							<amplify-button
								variant="anchor"
								onClick={() =>
									this.handleAuthStateChange(AuthState.ForgotPassword)
								}
								data-test="sign-in-forgot-password-link"
							>
								{I18n.get(Translations.RESET_PASSWORD_TEXT)}
							</amplify-button>
						</div>
					) : (
						newField['hint']
					);
				}
				newField['handleInputChange'] = event =>
					this.handleFormFieldInputWithCallback(event, field);
				this.setFieldValue(newField, this.signInAttributes);
				newFields.push(newField);
			});
			this.newFormFields = newFields;
		}
	}

	setFieldValue(
		field: PhoneFormFieldType | FormFieldType,
		formAttributes: SignInAttributes
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
					this.phoneNumber.countryDialCodeValue = (field as PhoneFormFieldType).dialCode;
				}
				this.phoneNumber.phoneNumberValue = field.value;
				break;
			case 'password':
				if (field.value === undefined) {
					formAttributes.password = '';
				} else {
					formAttributes.password = field.value;
				}
				break;
		}
	}

	render() {
		return (
			<Host>
				<amplify-form-section
					headerText={I18n.get(this.headerText)}
					handleSubmit={this.handleSubmit}
					testDataPrefix={'sign-in'}
				>
					<div slot="subtitle">
						<slot name="header-subtitle"></slot>
					</div>
					<slot name="federated-buttons">
						<amplify-federated-buttons
							handleAuthStateChange={this.handleAuthStateChange}
							federated={this.federated}
						/>
					</slot>

					{!isEmpty(this.federated) && <amplify-strike>or</amplify-strike>}

					<amplify-auth-fields formFields={this.newFormFields} />
					<div slot="amplify-form-section-footer" class="sign-in-form-footer">
						<slot name="footer">
							{!this.hideSignUp && (
								<slot name="secondary-footer-content">
									<span>
										{I18n.get(Translations.NO_ACCOUNT_TEXT)}{' '}
										<amplify-button
											variant="anchor"
											onClick={() =>
												this.handleAuthStateChange(AuthState.SignUp)
											}
											data-test="sign-in-create-account-link"
										>
											{I18n.get(Translations.CREATE_ACCOUNT_TEXT)}
										</amplify-button>
									</span>
								</slot>
							)}

							<div class={this.hideSignUp ? 'full-width-footer-content' : ''}>
								<slot name="primary-footer-content">
									<amplify-button
										type="submit"
										disabled={this.loading}
										data-test="sign-in-sign-in-button"
									>
										{this.loading ? (
											<amplify-loading-spinner />
										) : (
											<span>{I18n.get(this.submitButtonText)}</span>
										)}
									</amplify-button>
								</slot>
							</div>
						</slot>
					</div>
				</amplify-form-section>
			</Host>
		);
	}
}
