import {
	AuthProvider,
	AuthOptions,
	SignUp,
	ConfirmSignUp,
	DeleteAccount,
	ResendSignUpCode,
	ChangePassword,
	UpdateUserAttribute,
	UpdatePreferredMfa,
	VerifyUserAttribute,
	ConfirmVerifyUserAttribute,
	SignIn,
	SignInWithSocialToken,
	SignInWithSocialUI,
	ConfirmSignIn,
	SetupTotp,
	VerifyTotpToken,
	ResetPassword,
	ConfirmResetPassword,
	GetUser,
	RegisterDevice,
	UnregisterDevice,
} from './types';
import { AuthProviderDefault } from './ProviderDefault';

class AuthSingleton implements AuthProvider {
	config?: AuthOptions;
	provider: AuthProvider = new AuthProviderDefault();

	replacePluggable = (provider: AuthProvider) => {
		this.provider = provider;
	};

	removePluggable = () => {
		if (this.provider.getProviderName() !== 'AmazonCognito') {
			this.provider = new AuthProviderDefault();
			if (this.config) {
				this.provider.configure(this.config);
			}
		}
	};

	getModuleName = (): 'Auth' => 'Auth';
	getProviderName = () => 'AmazonCognito';

	configure(config: AuthOptions) {
		this.config = config;
		return this.provider.configure(config);
	}

	signUp: SignUp = params => {
		return this.provider.signUp(params);
	};

	confirmSignUp: ConfirmSignUp = params => {
		return this.provider.confirmSignUp(params);
	};

	deleteAccount: DeleteAccount = () => {
		return this.provider.deleteAccount();
	};

	resendSignUpCode: ResendSignUpCode = params => {
		return this.provider.resendSignUpCode(params);
	};

	changePassword: ChangePassword = params => {
		return this.provider.changePassword(params);
	};

	updateUserAttribute: UpdateUserAttribute = params => {
		return this.provider.updateUserAttribute(params);
	};

	updatePreferredMFA: UpdatePreferredMfa = params => {
		return this.provider.updatePreferredMFA(params);
	};

	verifyUserAttribute: VerifyUserAttribute = params => {
		return this.provider.verifyUserAttribute(params);
	};

	confirmVerifyUserAttribute: ConfirmVerifyUserAttribute = params => {
		return this.provider.confirmVerifyUserAttribute(params);
	};

	signIn: SignIn = params => {
		return this.provider.signIn(params);
	};

	signInWithSocialToken: SignInWithSocialToken = params => {
		return this.provider.signInWithSocialToken(params);
	};

	signInWithSocialUI: SignInWithSocialUI = params => {
		return this.provider.signInWithSocialUI(params);
	};

	confirmSignIn: ConfirmSignIn = params => {
		return this.provider.confirmSignIn(params);
	};

	setupTotp: SetupTotp = params => {
		return this.provider.setupTotp(params);
	};

	verifyTotpToken: VerifyTotpToken = params => {
		return this.provider.verifyTotpToken(params);
	};

	resetPassword: ResetPassword = params => {
		return this.provider.resetPassword(params);
	};

	confirmResetPassword: ConfirmResetPassword = params => {
		return this.provider.confirmResetPassword(params);
	};

	getUser: GetUser = () => {
		return this.provider.getUser();
	};

	registerDevice: RegisterDevice = params => {
		return this.provider.registerDevice(params);
	};

	unregisterDevice: UnregisterDevice = params => {
		return this.provider.unregisterDevice(params);
	};
}

export const AuthNext = new AuthSingleton();
