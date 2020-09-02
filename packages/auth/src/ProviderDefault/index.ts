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
	AuthSignUpStep,
	ConfirmSignUpParams,
} from '../types';
import {
	SignUpCommandInput,
	SignUpCommandOutput,
	ConfirmSignUpCommandInput,
	ConfirmSignUpCommandOutput,
	DeleteUserCommandInput,
	DeleteUserCommandOutput,
	ResendConfirmationCodeCommandInput,
	ResendConfirmationCodeCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { Request } from './request';

export class AuthProviderDefault implements AuthProvider {
	request: ReturnType<Request>;
	clientId?: string;
	accessToken?: string;

	getModuleName = (): 'Auth' => 'Auth';
	getProviderName = () => 'AmazonCognito';

	configure(config: AuthOptions) {
		this.request = Request({
			clientId: config.userPoolWebClientId,
			region: config.region,
		});

		alert('configure Call');
	}

	// TODO: revisit type incompatibility
	// @ts-ignore
	signUp: SignUp = async params => {
		const requestParams: SignUpCommandInput = {
			ClientId: this.clientId,
			ClientMetadata: params.options && params.options.pluginOptions,
			Password: params.password,
			UserAttributes: params.options && params.options.userAttributes,
			Username: params.username,
		};
		const response = await this.request<SignUpCommandOutput>(
			'SignUp',
			requestParams
		);
		if (response.__type) {
			// @ts-ignore
			throw new CognitoError(response.message, 400, response.__type, 400);
		}
		const result: AuthSignUpResult = {
			isSignUpComplete: response.UserConfirmed,
			// @ts-ignore
			nextStep: response.CodeDeliveryDetails
				? {
						// TODO: fix
						additionalInfo: {},
						codeDeliveryDetails: response.CodeDeliveryDetails,
						signUpStep: response.UserConfirmed
							? AuthSignUpStep.DONE
							: AuthSignUpStep.CONFIRM_SIGN_UP,
				  }
				: undefined,
		};
		return result;
	};

	confirmSignUp: ConfirmSignUp = async params => {
		const requestParams: ConfirmSignUpCommandInput = {
			AnalyticsMetadata:
				params.options &&
				params.options.pluginOptions &&
				params.options.pluginOptions.analyticsMetadata,
			ClientId: this.clientId,
			ConfirmationCode: params.code,
			Username: params.username,
		};

		const response = await this.request<ConfirmSignUpCommandOutput>(
			'ConfirmSignUp',
			requestParams
		);

		if (response.__type) {
			// @ts-ignore
			throw new CognitoError(response.message, 400, response.__type, 400);
		}

		const confirmSignUpResult: AuthSignUpResult = {
			isSignUpComplete: true,
		};

		return confirmSignUpResult;
	};

	deleteAccount: DeleteAccount = async () => {
		if (!this.accessToken) {
			throw new Error('TBD');
		}

		const requestParams: DeleteUserCommandInput = {
			AccessToken: this.accessToken,
		};

		const response = await this.request<DeleteUserCommandOutput>(
			'DeleteUser',
			requestParams
		);

		// @ts-ignore
		if (response.__type) {
			// @ts-ignore
			throw new CognitoError(response.message, 400, response.__type, 400);
		}

		return;
	};

	resendSignUpCode: ResendSignUpCode = async params => {
		const requestParams: ResendConfirmationCodeCommandInput = {
			ClientId: this.clientId,
			Username: params.username,
		};

		const response = await this.request<ResendConfirmationCodeCommandOutput>(
			'ResendConfirmationCode',
			requestParams
		);

		// @ts-ignore
		if (response.__type) {
			// @ts-ignore
			throw new CognitoError(response.message, 400, response.__type, 400);
		}

		const result: AuthSignUpResult = {
			isSignUpComplete: false,
			// @ts-ignore
			nextStep: response.CodeDeliveryDetails
				? {
						// TODO: fix
						additionalInfo: {},
						codeDeliveryDetails: response.CodeDeliveryDetails,
						signUpStep: AuthSignUpStep.CONFIRM_SIGN_UP,
				  }
				: undefined,
		};

		return result;
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
