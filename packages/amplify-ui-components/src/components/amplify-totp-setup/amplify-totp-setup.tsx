import { Auth } from '@aws-amplify/auth';
import { I18n, Logger } from '@aws-amplify/core';
import { Component, Prop, State, h, Host } from '@stencil/core';
import QRCode from 'qrcode';

import {
	CognitoUserInterface,
	AuthStateHandler,
	MfaOption,
	AuthState,
} from '../../common/types/auth-types';
import { Translations } from '../../common/Translations';
import { TOTPSetupEventType } from './amplify-totp-setup-interface';
import {
	NO_AUTH_MODULE_FOUND,
	SETUP_TOTP,
	SUCCESS,
} from '../../common/constants';
import {
	dispatchToastHubEvent,
	dispatchAuthStateChangeEvent,
	onAuthUIStateChange,
} from '../../common/helpers';
import { checkContact } from '../../common/auth-helpers';

const logger = new Logger('TOTP');
@Component({
	tag: 'amplify-totp-setup',
	styleUrl: 'amplify-totp-setup.scss',
	shadow: true,
})
export class AmplifyTOTPSetup {
	private inputProps: object = {
		autoFocus: true,
	};

	/** Used in order to configure TOTP for a user */
	@Prop() user: CognitoUserInterface;
	/** Auth state change handler for this component */
	@Prop()
	handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;
	/** Used for header text in totp setup component */
	@Prop() headerText: string = Translations.TOTP_HEADER_TEXT;
	/** Used for customizing the issuer string in the qr code image */
	@Prop() issuer: string = Translations.TOTP_ISSUER;

	@State() code: string | null = null;
	@State() setupMessage: string | null = null;
	@State() qrCodeImageSource: string;
	@State() qrCodeInput: string | null = null;
	@State() loading: boolean = false;
	private removeHubListener: () => void; // unsubscribe function returned by onAuthUIStateChange

	async componentWillLoad() {
		/**
		 * We didn't use `@Watch` here because it doesn't fire when we go from require-new-password to totp-setup.
		 * That is because `Auth.completeNewPassword` only changes `user` in place and Watch doesn't detect changes
		 * unless we make a clone.
		 */
		this.removeHubListener = onAuthUIStateChange(authState => {
			if (authState === AuthState.TOTPSetup) this.setup();
		});
		await this.setup();
	}

	disconnectedCallback() {
		this.removeHubListener && this.removeHubListener(); // stop listening to `onAuthUIStateChange`
	}

	private buildOtpAuthPath(
		user: CognitoUserInterface,
		issuer: string,
		secretKey: string
	) {
		return `otpauth://totp/${issuer}:${user.username}?secret=${secretKey}&issuer=${issuer}`;
	}

	private async onTOTPEvent(
		event: TOTPSetupEventType,
		data: any,
		user: CognitoUserInterface
	) {
		logger.debug('on totp event', event, data);

		if (event === SETUP_TOTP && data === SUCCESS) {
			await checkContact(user, this.handleAuthStateChange);
		}
	}

	private handleTotpInputChange(event) {
		this.setupMessage = null;
		this.qrCodeInput = event.target.value;
	}

	private async generateQRCode(codeFromTotp: string) {
		try {
			this.qrCodeImageSource = await QRCode.toDataURL(codeFromTotp);
		} catch (error) {
			dispatchToastHubEvent(error);
		}
	}

	private async setup() {
		// ensure setup is only run once after totp setup is available
		if (!this.user || this.user.challengeName !== 'MFA_SETUP' || this.loading)
			return;
		this.setupMessage = null;
		const encodedIssuer = encodeURI(I18n.get(this.issuer));

		if (!Auth || typeof Auth.setupTOTP !== 'function') {
			throw new Error(NO_AUTH_MODULE_FOUND);
		}

		this.loading = true;
		try {
			const secretKey = await Auth.setupTOTP(this.user);
			logger.debug('secret key', secretKey);
			this.code = this.buildOtpAuthPath(this.user, encodedIssuer, secretKey);

			this.generateQRCode(this.code);
		} catch (error) {
			dispatchToastHubEvent(error);
			logger.debug(I18n.get(Translations.TOTP_SETUP_FAILURE), error);
		} finally {
			this.loading = false;
		}
	}

	private async verifyTotpToken(event: Event) {
		if (event) {
			event.preventDefault();
		}

		if (!this.qrCodeInput) {
			logger.debug('No TOTP Code provided');
			return;
		}

		const user = this.user;

		if (
			!Auth ||
			typeof Auth.verifyTotpToken !== 'function' ||
			typeof Auth.setPreferredMFA !== 'function'
		) {
			throw new Error(NO_AUTH_MODULE_FOUND);
		}

		try {
			await Auth.verifyTotpToken(user, this.qrCodeInput);
			await Auth.setPreferredMFA(user, MfaOption.TOTP);

			this.setupMessage = I18n.get(Translations.TOTP_SUCCESS_MESSAGE);
			logger.debug(I18n.get(Translations.TOTP_SUCCESS_MESSAGE));

			await this.onTOTPEvent(SETUP_TOTP, SUCCESS, user);
		} catch (error) {
			this.setupMessage = I18n.get(Translations.TOTP_SETUP_FAILURE);
			logger.error(error);
		}
	}

	render() {
		return (
			<Host>
				<amplify-form-section
					headerText={I18n.get(this.headerText)}
					submitButtonText={I18n.get(Translations.TOTP_SUBMIT_BUTTON_TEXT)}
					handleSubmit={event => this.verifyTotpToken(event)}
					loading={this.loading}
				>
					<div class="totp-setup">
						{this.qrCodeImageSource && (
							<img
								src={this.qrCodeImageSource}
								alt={I18n.get(Translations.QR_CODE_ALT)}
							/>
						)}
						<amplify-form-field
							label={I18n.get(Translations.TOTP_LABEL)}
							inputProps={this.inputProps}
							fieldId="totpCode"
							name="totpCode"
							handleInputChange={event => this.handleTotpInputChange(event)}
						/>
					</div>
				</amplify-form-section>
			</Host>
		);
	}
}
