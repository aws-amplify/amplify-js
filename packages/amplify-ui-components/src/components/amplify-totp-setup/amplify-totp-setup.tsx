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
import { NO_AUTH_MODULE_FOUND } from '../../common/constants';
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
	/** This is run after totp setup is complete. Useful if using this as standalone. */
	@Prop() handleComplete: (
		user: CognitoUserInterface
	) => void | Promise<void> = this.onTOTPEvent;

	@State() code: string | null = null;
	@State() setupMessage: string | null = null;
	@State() qrCodeImageSource: string;
	@State() qrCodeInput: string | null = null;
	@State() loading: boolean = false;
	private removeHubListener: () => void; // unsubscribe function returned by onAuthUIStateChange

	async componentWillLoad() {
		/**
		 * We dont't use `@Watch` here because it doesn't fire when we go from require-new-password
		 * to totp-setup. This is because stencil only does shallow comparison on @Watch and can't
		 * detect changes from `Auth.requireNewPassword.
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

	private async onTOTPEvent(user: CognitoUserInterface) {
		logger.debug('on totp event');
		await checkContact(user, this.handleAuthStateChange);
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
		if (this.code || this.loading) {
			logger.debug(
				'setup was called while another is in progress, skipping setup.'
			);
			return;
		}

		if (!this.user || !this.user.associateSoftwareToken) {
			logger.debug(
				'setup was attempted with invalid `user`, skipping setup.',
				this.user
			);
			return;
		}
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
			await this.handleComplete(user);
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
