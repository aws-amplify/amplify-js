import { Component, Prop, State, h } from '@stencil/core';
import { I18n, Logger } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';
import {
	CognitoUserInterface,
	MFATypesInterface,
	MfaOption,
} from '../../common/types/auth-types';
import {
	NO_AUTH_MODULE_FOUND,
	USER_NOT_SETUP_SOFTWARE_TOKEN_MFA,
	USER_NOT_VERIFIED_SOFTWARE_TOKEN_MFA,
} from '../../common/constants';
import { Translations } from '../../common/Translations';

const logger = new Logger('SelectMFAType');

@Component({
	tag: 'amplify-select-mfa-type',
	shadow: true,
})
export class AmplifySelectMFAType {
	/** Types of MFA options */
	@Prop() MFATypes: MFATypesInterface;
	/** Current authenticated user in order to sign requests properly for TOTP */
	@Prop() authData: CognitoUserInterface;
	/** Fires when Verify is clicked */
	@Prop() handleSubmit: (event: Event) => void = (event) => this.verify(event);

	@State() TOTPSetup: boolean = false;
	@State() selectMessage: string = null;
	@State() MFAMethod: MfaOption = null;

	@State() isTOTP: boolean = false;
	@State() isNoMFA: boolean = false;
	@State() isSMS: boolean = false;
	@State() loading: boolean = false;

	@State() isToastVisible: boolean = false;

	private handleRadioButtonChange(event) {
		this.TOTPSetup = false;
		this.selectMessage = null;

		// Reseting state values to default
		this.isNoMFA = false;
		this.isTOTP = false;
		this.isSMS = false;
		this.isToastVisible = false;

		const { value, type, checked } = event.target;
		const checkType = ['radio', 'checkbox'].includes(type);

		if (value === MfaOption.SMS && checkType) {
			this.isSMS = checked;
		}

		if (value === MfaOption.TOTP && checkType) {
			this.isTOTP = checked;
		}

		if (value === MfaOption.NOMFA && checkType) {
			this.isNoMFA = checked;
		}
	}

	private async verify(event: Event) {
		// avoid submitting the form
		if (event) {
			event.preventDefault();
		}

		logger.debug('MFA Type Values', {
			TOTP: this.isTOTP,
			SMS: this.isSMS,
			'No MFA': this.isNoMFA,
		});

		if (this.isTOTP) {
			this.MFAMethod = MfaOption.TOTP;
		} else if (this.isSMS) {
			this.MFAMethod = MfaOption.SMS;
		} else if (this.isNoMFA) {
			this.MFAMethod = MfaOption.NOMFA;
		}

		const user = this.authData;

		if (!Auth || typeof Auth.setPreferredMFA !== 'function') {
			throw new Error(NO_AUTH_MODULE_FOUND);
		}

		this.loading = true;
		try {
			const preferredMFAData = await Auth.setPreferredMFA(user, this.MFAMethod);

			logger.debug('Set Preferred MFA Succeeded', preferredMFAData);
			this.selectMessage = `${I18n.get(Translations.SUCCESS_MFA_TYPE)} ${
				this.MFAMethod
			}`;
		} catch (error) {
			const { message } = error;

			if (
				message === USER_NOT_SETUP_SOFTWARE_TOKEN_MFA ||
				message === USER_NOT_VERIFIED_SOFTWARE_TOKEN_MFA
			) {
				this.TOTPSetup = true;
				this.selectMessage = I18n.get(Translations.SETUP_TOTP_REQUIRED);
			} else {
				logger.debug('Set Preferred MFA failed', error);
				this.selectMessage = I18n.get(
					Translations.UNABLE_TO_SETUP_MFA_AT_THIS_TIME
				);
			}
		} finally {
			this.loading = false;
			this.isToastVisible = true;
		}
	}

	private contentBuilder() {
		if (!this.MFATypes || Object.keys(this.MFATypes).length < 2) {
			logger.debug(I18n.get(Translations.LESS_THAN_TWO_MFA_VALUES_MESSAGE));
			return (
				<div>
					<a>{I18n.get(Translations.LESS_THAN_TWO_MFA_VALUES_MESSAGE)}</a>
				</div>
			);
		}

		const { SMS, TOTP, Optional } = this.MFATypes;

		return (
			<amplify-form-section
				submitButtonText={I18n.get(
					Translations.SELECT_MFA_TYPE_SUBMIT_BUTTON_TEXT
				)}
				headerText={I18n.get(Translations.SELECT_MFA_TYPE_HEADER_TEXT)}
				handleSubmit={(event) => this.handleSubmit(event)}
				loading={this.loading}
			>
				{SMS ? (
					<amplify-radio-button
						key="sms"
						name="MFAType"
						value="SMS"
						label="SMS"
						handleInputChange={(event) => this.handleRadioButtonChange(event)}
					/>
				) : null}
				{TOTP ? (
					<amplify-radio-button
						key="totp"
						name="MFAType"
						value="TOTP"
						label="TOTP"
						handleInputChange={(event) => this.handleRadioButtonChange(event)}
					/>
				) : null}
				{Optional ? (
					<amplify-radio-button
						key="noMFA"
						name="MFAType"
						value="NOMFA"
						label="No MFA"
						handleInputChange={(event) => this.handleRadioButtonChange(event)}
					/>
				) : null}
			</amplify-form-section>
		);
	}

	private renderToast() {
		if (this.isToastVisible && this.selectMessage) {
			return (
				<amplify-toast
					message={this.selectMessage}
					handleClose={() => {
						this.selectMessage = null;
						this.isToastVisible = false;
					}}
				/>
			);
		}

		return null;
	}

	render() {
		return (
			<div>
				{this.contentBuilder()}
				{this.TOTPSetup ? <amplify-totp-setup user={this.authData} /> : null}
				{this.renderToast()}
			</div>
		);
	}
}
