import { Component, State, Prop, h, Host, Element } from '@stencil/core';
import {
	AuthState,
	CognitoUserInterface,
	FederatedConfig,
	UsernameAliasStrings,
	AuthStateHandler,
} from '../../common/types/auth-types';
import {
	AUTH_CHANNEL,
	NO_AUTH_MODULE_FOUND,
	UI_AUTH_CHANNEL,
	TOAST_AUTH_ERROR_EVENT,
} from '../../common/constants';
import { authSlotNames } from './auth-slot-names';
import { Auth, appendToCognitoUserAgent } from '@aws-amplify/auth';
import { Hub, Logger } from '@aws-amplify/core';
import {
	dispatchAuthStateChangeEvent,
	onAuthUIStateChange,
} from '../../common/helpers';
import { checkContact } from '../../common/auth-helpers';
import { JSXBase } from '@stencil/core/internal';

const logger = new Logger('Authenticator');

/**
 * @slot sign-in - Content placed inside of the sign in workflow for when a user wants to sign into their account
 * @slot confirm-sign-in - Content placed inside of the confirm sign in workflow for when a user needs to confirm the account they signed in with
 * @slot sign-up - Content placed inside of the sign up workflow for when a user wants to register a new account
 * @slot confirm-sign-up - Content placed inside of the confirm sign up workflow for when a user needs to confirm the account they signed up with
 * @slot forgot-password - Content placed inside of the forgot password workflow for when a user wants to reset their password
 * @slot require-new-password - Content placed inside of the require new password workflow for when a user is required to update their password
 * @slot verify-contact - Content placed inside of the verify-contact workflow for when a user must verify their contact information
 * @slot totp-setup - Content placed inside of the totp-setup workflow for when a user opts to use TOTP MFA
 * @slot greetings - Content placed inside of the greetings navigation for when a user is signed in
 * @slot loading - Content placed inside of the loading workflow for when the app is loading
 */
@Component({
	tag: 'amplify-authenticator',
	styleUrl: 'amplify-authenticator.scss',
	shadow: true,
})
export class AmplifyAuthenticator {
	/** Initial starting state of the Authenticator component. E.g. If `signup` is passed the default component is set to AmplifySignUp */
	@Prop() initialAuthState:
		| AuthState.SignIn
		| AuthState.SignUp
		| AuthState.ForgotPassword = AuthState.SignIn;
	/** Federated credentials & configuration. */
	@Prop() federated: FederatedConfig;
	/** Username Alias is used to setup authentication with `username`, `email` or `phone_number`  */
	@Prop() usernameAlias: UsernameAliasStrings;
	/** Callback for Authenticator state machine changes */
	@Prop() handleAuthStateChange: AuthStateHandler = () => {};
	/** Hide amplify-toast for auth errors */
	@Prop() hideToast: boolean = false;

	@State() authState: AuthState = AuthState.Loading;
	@State() authData: CognitoUserInterface;
	@State() toastMessage: string = '';

	@Element() el: HTMLAmplifyAuthenticatorElement;

	private handleExternalAuthEvent = ({ payload }) => {
		switch (payload.event) {
			case 'cognitoHostedUI':
			case 'signIn':
				checkContact(payload.data, dispatchAuthStateChangeEvent);
				break;
			case 'cognitoHostedUI_failure':
			case 'parsingUrl_failure':
			case 'signOut':
			case 'customGreetingSignOut':
				return dispatchAuthStateChangeEvent(this.initialAuthState);
		}
	};

	private handleToastEvent = ({ payload }) => {
		switch (payload.event) {
			case TOAST_AUTH_ERROR_EVENT:
				if (payload.message) this.toastMessage = payload.message;
				break;
		}
	};

	async componentWillLoad() {
		onAuthUIStateChange((authState, authData) => {
			this.onAuthStateChange(authState, authData as CognitoUserInterface);
			this.toastMessage = '';
		});
		if (!this.hideToast) Hub.listen(UI_AUTH_CHANNEL, this.handleToastEvent);
		Hub.listen(AUTH_CHANNEL, this.handleExternalAuthEvent);

		appendToCognitoUserAgent('amplify-authenticator');
		await this.checkUser();
	}

	private async checkUser(): Promise<void> {
		if (!Auth || typeof Auth.currentAuthenticatedUser !== 'function') {
			throw new Error(NO_AUTH_MODULE_FOUND);
		}

		return Auth.currentAuthenticatedUser()
			.then(user => {
				dispatchAuthStateChangeEvent(AuthState.SignedIn, user);
			})
			.catch(() => {
				dispatchAuthStateChangeEvent(this.initialAuthState);
			});
	}

	private async onAuthStateChange(
		nextAuthState: AuthState,
		data?: CognitoUserInterface
	) {
		if (nextAuthState === undefined)
			return logger.error('nextAuthState cannot be undefined');

		logger.info(
			'Inside onAuthStateChange Method current authState:',
			this.authState
		);

		if (nextAuthState === AuthState.SignedOut) {
			this.authState = this.initialAuthState;
		} else {
			this.authState = nextAuthState;
		}

		this.authData = data;
		if (this.authData) logger.log('Auth Data was set:', this.authData);

		if (this.authState === nextAuthState) {
			this.handleAuthStateChange(this.authState, this.authData);
			logger.info(`authState has been updated to ${this.authState}`);
		}
	}

	// Returns the auth component corresponding to the given authState.
	private getAuthComponent(authState: AuthState): JSXBase.IntrinsicElements {
		switch (authState) {
			case AuthState.SignIn:
				return (
					<amplify-sign-in
						federated={this.federated}
						usernameAlias={this.usernameAlias}
					/>
				);
			case AuthState.ConfirmSignIn:
				return <amplify-confirm-sign-in user={this.authData} />;
			case AuthState.SignUp:
				return <amplify-sign-up usernameAlias={this.usernameAlias} />;
			case AuthState.ConfirmSignUp:
				return (
					<amplify-confirm-sign-up
						user={this.authData}
						usernameAlias={this.usernameAlias}
					/>
				);
			case AuthState.ForgotPassword:
				return <amplify-forgot-password usernameAlias={this.usernameAlias} />;
			case AuthState.ResetPassword:
				return <amplify-require-new-password user={this.authData} />;
			case AuthState.VerifyContact:
				return <amplify-verify-contact user={this.authData} />;
			case AuthState.TOTPSetup:
				return <amplify-totp-setup user={this.authData} />;
			case AuthState.Loading:
				return <div>Loading...</div>;
			default:
				throw new Error(`Unhandled auth state: ${authState}`);
		}
	}

	// Returns a slot containing the Auth component corresponding to the given authState
	private getSlotWithAuthComponent(
		authState: AuthState
	): JSXBase.IntrinsicElements {
		const authComponent = this.getAuthComponent(authState);
		const slotName = authSlotNames[authState];
		const slotIsEmpty = this.el.querySelector(`[slot="${slotName}"]`) === null; // true if no element has been inserted to the slot

		/**
		 * Connect the inner auth component to DOM only if the slot hasn't been overwritten. This prevents
		 * the overwritten component from calling its lifecycle methods.
		 */
		return <slot name={slotName}>{slotIsEmpty && authComponent}</slot>;
	}

	disconnectedCallback() {
		Hub.remove(AUTH_CHANNEL, this.handleExternalAuthEvent);
		if (!this.hideToast) Hub.remove(UI_AUTH_CHANNEL, this.handleToastEvent);
		return onAuthUIStateChange;
	}

	render() {
		return (
			<Host>
				{!this.hideToast && this.toastMessage && (
					<amplify-toast
						message={this.toastMessage}
						handleClose={() => {
							this.toastMessage = '';
						}}
						data-test="authenticator-error"
					/>
				)}
				{this.authState === AuthState.SignedIn ? (
					[<slot name="greetings"></slot>, <slot></slot>]
				) : (
					<div class="auth-container">
						{this.getSlotWithAuthComponent(this.authState)}
					</div>
				)}
			</Host>
		);
	}
}
