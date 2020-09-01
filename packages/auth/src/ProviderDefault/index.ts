import {
	AuthProvider,
	AuthOptions,
	SignUp,
	ConfirmSignUp,
	DeleteAccount,
	ResendSignUpCode,
	AuthSignUpResult,
	ChangePassword,
	AuthStateFlow,
	UpdateUserAttribute,
	UpdatePreferredMfa,
	VerifyUserAttribute,
	ConfirmVerifyUserAttribute,
	SignIn,
	AuthSignInResult,
	SignInWithSocialToken,
	SignInWithSocialUI,
	ConfirmSignIn,
	AuthConfirmSignInResult,
	SetupTotp,
	VerifyTotpToken,
	ResetPassword,
	ConfirmResetPassword,
	GetUser,
	AuthUser,
	RegisterDevice,
	UnregisterDevice,
} from '../types';

export class AuthProviderDefault implements AuthProvider {
	getModuleName = (): 'Auth' => 'Auth';
	getProviderName = () => 'AmazonCognito';

	configure(config: AuthOptions) {
		alert('configure Call');
	}

	signUp: SignUp = async params => {
		alert('signUp Call');
		return undefined as AuthSignUpResult;
	};

	confirmSignUp: ConfirmSignUp = async params => {
		alert('confirmSignUp Call');
		return undefined as AuthSignUpResult;
	};

	deleteAccount: DeleteAccount = async () => {
		alert('deleteAccount Call');
	};

	resendSignUpCode: ResendSignUpCode = async params => {
		alert('resendSignUpCode Call');
		return undefined as AuthSignUpResult;
	};

	changePassword: ChangePassword = async params => {
		alert('changePassword Call');
		return undefined as AuthStateFlow;
	};

	updateUserAttribute: UpdateUserAttribute = async params => {
		alert('updateUserAttribute call');
		return undefined as AuthStateFlow;
	};

	updatePreferredMFA: UpdatePreferredMfa = async params => {
		alert('updatePreferredMFA Call');
		return undefined as AuthStateFlow;
	};

	verifyUserAttribute: VerifyUserAttribute = async params => {
		alert('verifyUserAttribute Call');
		return undefined as AuthStateFlow;
	};

	confirmVerifyUserAttribute: ConfirmVerifyUserAttribute = async params => {
		alert('confirmVerifyUserAttribute Call');
		return undefined as AuthStateFlow;
	};

	signIn: SignIn = async params => {
		alert('SignIn Call');
		return undefined as AuthSignInResult;
	};

	signInWithSocialToken: SignInWithSocialToken = async params => {
		alert('signInWithSocialToken Call');
		return undefined as AuthSignInResult;
	};

	signInWithSocialUI: SignInWithSocialUI = async params => {
		alert('signInWithSocialUI Call');
		return undefined as AuthSignInResult;
	};

	confirmSignIn: ConfirmSignIn = async params => {
		alert('confirmSignIn Call');
		return undefined as AuthConfirmSignInResult;
	};

	setupTotp: SetupTotp = async params => {
		alert('setupTotp Call');
		return undefined as AuthStateFlow;
	};

	verifyTotpToken: VerifyTotpToken = async params => {
		alert('verifyTotpToken Call');
		return undefined as AuthStateFlow;
	};

	resetPassword: ResetPassword = async params => {
		alert('resetPassword Call');
		return undefined as AuthStateFlow;
	};

	confirmResetPassword: ConfirmResetPassword = async params => {
		alert('confirmResetPassword Call');
		return undefined as AuthStateFlow;
	};

	getUser: GetUser = async () => {
		alert('getUser Call');
		return undefined as AuthUser;
	};

	registerDevice: RegisterDevice = async params => {
		alert('registerDevice Call');
		return undefined as AuthUser;
	};

	unregisterDevice: UnregisterDevice = async params => {
		alert('unregisterDevice Call');
		return undefined as AuthUser;
	};
}
