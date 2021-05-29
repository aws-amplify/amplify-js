import { Auth } from '@aws-amplify/auth';
import { I18n } from '@aws-amplify/core';
import { Component, Prop, State, h, Host, Watch } from '@stencil/core';
import {
	FormFieldType,
	FormFieldTypes,
} from '../../components/amplify-auth-fields/amplify-auth-fields-interface';
import {
	AuthState,
	MfaOption,
	CognitoUserInterface,
	ChallengeName,
	AuthStateHandler,
} from '../../common/types/auth-types';
import { NO_AUTH_MODULE_FOUND } from '../../common/constants';
import {
	dispatchToastHubEvent,
	dispatchAuthStateChangeEvent,
} from '../../common/helpers';
import { Translations } from '../../common/Translations';
import { checkContact } from '../../common/auth-helpers';

@Component({
	tag: 'amplify-confirm-sign-in',
	shadow: true,
})
export class AmplifyConfirmSignIn {
	/** Fires when confirm sign in form is submitted */
	@Prop() handleSubmit: (event: Event) => void = event => this.confirm(event);
	/** Used for header text in confirm sign in component */
	@Prop() headerText: string = Translations.CONFIRM_SMS_CODE;
	/** Used for the submit button text in confirm sign in component */
	@Prop() submitButtonText: string = Translations.CONFIRM;
	/** Auth state change handler for this component */
	@Prop()
	handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;
	/** Default form field */
	private defaultFormFields: FormFieldTypes = [
		{
			type: 'code',
			required: true,
			handleInputChange: event => this.handleCodeChange(event),
		},
	];
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
	@Prop() formFields: FormFieldTypes | string[] = this.defaultFormFields;
	/** Cognito user signing in */
	@Prop() user: CognitoUserInterface;
	/** The MFA option to confirm with */
	@State() mfaOption: MfaOption = MfaOption.SMS;
	/* Whether or not the confirm-sign-in component is loading */
	@State() loading: boolean = false;
	/* The code value in the confirm-sign-in form */
	@State() code: string;
	/* The constructed form field options */
	private constructedFormFieldOptions: FormFieldTypes | string[];

	componentWillLoad() {
		this.setup();
	}

	@Watch('user')
	userHandler() {
		this.setup();
	}

	private setup() {
		if (
			this.user &&
			this.user['challengeName'] === ChallengeName.SoftwareTokenMFA
		) {
			this.mfaOption = MfaOption.TOTP;
			// If header text is using default use TOTP string
			if (this.headerText === Translations.CONFIRM_SMS_CODE) {
				this.headerText = Translations.CONFIRM_TOTP_CODE;
			}
		}
		this.constructedFormFieldOptions = this.constructFormFieldOptions(
			this.formFields
		);
	}

	private handleCodeChange(event) {
		this.code = event.target.value;
	}

	private async confirm(event: Event) {
		if (event) {
			event.preventDefault();
		}
		const mfaType =
			this.user['challengeName'] === ChallengeName.SoftwareTokenMFA
				? ChallengeName.SoftwareTokenMFA
				: null;
		if (!Auth || typeof Auth.confirmSignIn !== 'function') {
			throw new Error(NO_AUTH_MODULE_FOUND);
		}

		this.loading = true;
		try {
			await Auth.confirmSignIn(this.user, this.code, mfaType);
			await checkContact(this.user, this.handleAuthStateChange);
		} catch (error) {
			dispatchToastHubEvent(error);
		} finally {
			this.loading = false;
		}
	}

	private constructFormFieldOptions(
		formFields: FormFieldTypes | string[]
	): FormFieldTypes | string[] {
		const content = [];

		if (formFields === undefined) return undefined;
		if (formFields.length <= 0) return this.defaultFormFields;

		formFields.forEach((formField: FormFieldType | string) => {
			if (typeof formField === 'string' || formField.type !== 'code') {
				// This is either a `string`, and/or a custom field that isn't `code`. Pass this directly.
				content.push(formField);
			} else {
				// This is a code input field. Attach input handler.
				content.push({
					...(formField as FormFieldType), // `inputProps` will be passed over here.
					handleInputChange: event => this.handleCodeChange(event),
				});
			}
		});

		return content;
	}

	render() {
		return (
			<Host>
				<amplify-form-section
					headerText={I18n.get(this.headerText)}
					handleSubmit={this.handleSubmit}
					submitButtonText={I18n.get(this.submitButtonText)}
					loading={this.loading}
					secondaryFooterContent={
						<span>
							<amplify-button
								variant="anchor"
								onClick={() => this.handleAuthStateChange(AuthState.SignIn)}
							>
								{I18n.get(Translations.BACK_TO_SIGN_IN)}
							</amplify-button>
						</span>
					}
				>
					<amplify-auth-fields formFields={this.constructedFormFieldOptions} />
				</amplify-form-section>
			</Host>
		);
	}
}
