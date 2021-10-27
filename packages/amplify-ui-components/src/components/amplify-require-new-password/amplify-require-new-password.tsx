import { I18n } from '@aws-amplify/core';
import { Component, Prop, State, Watch, h, Host } from '@stencil/core';
import {
	FormFieldTypes,
	PhoneNumberInterface,
} from '../amplify-auth-fields/amplify-auth-fields-interface';
import {
	AuthState,
	ChallengeName,
	CognitoUserInterface,
	AuthFormField,
	AuthStateHandler,
} from '../../common/types/auth-types';
import {
	COUNTRY_DIAL_CODE_DEFAULT,
	NO_AUTH_MODULE_FOUND,
	PHONE_SUFFIX,
} from '../../common/constants';
import { Translations } from '../../common/Translations';

import { Auth } from '@aws-amplify/auth';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import {
	dispatchToastHubEvent,
	dispatchAuthStateChangeEvent,
	getRequiredAttributesMap,
	handlePhoneNumberChange,
	composePhoneNumberInput,
} from '../../common/helpers';
import { checkContact } from '../../common/auth-helpers';

const logger = new Logger('amplify-require-new-password');

@Component({
	tag: 'amplify-require-new-password',
	shadow: true,
})
export class AmplifyRequireNewPassword {
	/** The header text of the forgot password section */
	@Prop() headerText: string = Translations.CHANGE_PASSWORD;
	/** The text displayed inside of the submit button for the form */
	@Prop() submitButtonText: string = Translations.CHANGE_PASSWORD_ACTION;
	/** The function called when submitting a new password */
	@Prop() handleSubmit: (event: Event) => void = event =>
		this.completeNewPassword(event);
	/** Auth state change handler for this component */
	@Prop()
	handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;
	/** Used for the username to be passed to resend code */
	@Prop() user: CognitoUserInterface;
	/** The form fields displayed inside of the forgot password form */
	@Prop() formFields: FormFieldTypes = [
		{
			type: AuthFormField.Password,
			required: true,
			handleInputChange: event => this.handlePasswordChange(event),
			label: I18n.get(Translations.NEW_PASSWORD_LABEL),
			placeholder: I18n.get(Translations.NEW_PASSWORD_PLACEHOLDER),
			inputProps: {
				'data-test': 'require-new-password-password-input',
			},
		},
	];

	@State() password: string;
	@State() loading: boolean = false;

	@Watch('user')
	userHandler() {
		this.setCurrentUser();
	}

	private requiredAttributes: Record<PropertyKey, string> = {};
	private newFormFields: FormFieldTypes = this.formFields;
	private currentUser: CognitoUserInterface;
	private phoneNumber: PhoneNumberInterface = {
		countryDialCodeValue: COUNTRY_DIAL_CODE_DEFAULT,
		phoneNumberValue: ' ',
	};

	private handleRequiredAttributeInputChange(attribute, event) {
		if (attribute === 'phone_number') {
			this.formatPhoneNumber(event);
		} else {
			this.requiredAttributes[attribute] = event.target.value;
		}
	}

	async setCurrentUser(): Promise<void> {
		if (!this.user) {
			// Check for authenticated user
			try {
				const user = await Auth.currentAuthenticatedUser();
				if (user) this.currentUser = user;
			} catch (error) {
				dispatchToastHubEvent(error);
			}
		} else {
			this.currentUser = this.user;
		}
		if (
			this.currentUser &&
			this.currentUser.challengeParam &&
			this.currentUser.challengeParam.requiredAttributes
		) {
			const userRequiredAttributes = this.currentUser.challengeParam
				.requiredAttributes;
			const requiredAttributesMap = getRequiredAttributesMap();
			userRequiredAttributes.forEach((attribute: string) => {
				const formField = {
					type: attribute,
					required: true,
					label: requiredAttributesMap[attribute].label,
					placeholder: requiredAttributesMap[attribute].placeholder,
					handleInputChange: event =>
						this.handleRequiredAttributeInputChange(attribute, event),
					inputProps: {
						'data-test': `require-new-password-${attribute}-input`,
					},
				};
				this.newFormFields = [...this.newFormFields, formField];
			});
		}
	}

	componentWillLoad() {
		return this.setCurrentUser();
	}

	private handlePasswordChange(event) {
		this.password = event.target.value;
	}

	private formatPhoneNumber(event): void {
		handlePhoneNumberChange(event, this.phoneNumber);

		/**
		 * composePhoneNumberInput will throw an error if the phoneNumberValue it receives
		 * is empty. Adding a check here to try and make sure that doesn't happen...but will
		 * wrap it in a try/catch block just in case as well
		 */
		try {
			if (
				event.target.name === PHONE_SUFFIX &&
				this.phoneNumber.phoneNumberValue
			) {
				const composedInput = composePhoneNumberInput(this.phoneNumber);
				this.requiredAttributes['phone_number'] = composedInput;
			}
		} catch (err) {
			logger.error(`error in phone number field - ${err}`);
		}
	}

	private async completeNewPassword(event: Event) {
		if (event) {
			event.preventDefault();
		}

		if (!Auth || typeof Auth.completeNewPassword !== 'function') {
			throw new Error(NO_AUTH_MODULE_FOUND);
		}

		this.loading = true;
		try {
			const user = await Auth.completeNewPassword(
				this.currentUser,
				this.password,
				this.requiredAttributes
			);

			logger.debug('complete new password', user);
			switch (user.challengeName) {
				case ChallengeName.SMSMFA:
					this.handleAuthStateChange(AuthState.ConfirmSignIn, user);
					break;
				case ChallengeName.MFASetup:
					logger.debug('TOTP setup', user.challengeParam);
					this.handleAuthStateChange(AuthState.TOTPSetup, user);
					break;
				default:
					await checkContact(user, this.handleAuthStateChange);
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
					handleSubmit={this.handleSubmit}
					loading={this.loading}
					secondaryFooterContent={
						<amplify-button
							variant="anchor"
							onClick={() => this.handleAuthStateChange(AuthState.SignIn)}
						>
							{I18n.get(Translations.BACK_TO_SIGN_IN)}
						</amplify-button>
					}
					submitButtonText={I18n.get(this.submitButtonText)}
				>
					<amplify-auth-fields formFields={this.newFormFields} />
				</amplify-form-section>
			</Host>
		);
	}
}
