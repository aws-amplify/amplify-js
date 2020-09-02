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
	DeliveryMedium,
	AuthFlowType,
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
	InitiateAuthCommandInput,
	InitiateAuthCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { Request } from './request';
import { handleError } from './error';

export class AuthProviderDefault implements AuthProvider {
	request: ReturnType<Request>;
	clientId?: string;
	accessToken?: string;
	authFlow: AuthFlowType = AuthFlowType.USER_SRP_AUTH;

	getModuleName = (): 'Auth' => 'Auth';
	getProviderName = () => 'AmazonCognito';

	configure(config: AuthOptions) {
		this.clientId = config.userPoolWebClientId;

		this.request = Request({
			region: config.region,
			fetchOptions: {
				fetcher: config.fetcher,
			},
		});

		console.log('configure Call');
	}

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

		handleError(response);

		const result: AuthSignUpResult = {
			isSignUpComplete: response.UserConfirmed,
			nextStep: response.CodeDeliveryDetails
				? {
						additionalInfo: {},
						codeDeliveryDetails: {
							destination: response.CodeDeliveryDetails.Destination,
							deliveryMedium: response.CodeDeliveryDetails
								.DeliveryMedium as DeliveryMedium,
							attributeName: response.CodeDeliveryDetails.AttributeName,
						},
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

		handleError(response);

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

		handleError(response);

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

		handleError(response);

		const result: AuthSignUpResult = {
			isSignUpComplete: false,
			nextStep: response.CodeDeliveryDetails
				? {
						additionalInfo: {},
						codeDeliveryDetails: {
							destination: response.CodeDeliveryDetails.Destination,
							deliveryMedium: response.CodeDeliveryDetails
								.DeliveryMedium as DeliveryMedium,
							attributeName: response.CodeDeliveryDetails.AttributeName,
						},
						signUpStep: AuthSignUpStep.CONFIRM_SIGN_UP,
				  }
				: undefined,
		};

		return result;
	};

	changePassword: ChangePassword = async params => {
		console.log('changePassword Call');
		return undefined as AuthStateFlow;
	};

	updateUserAttribute: UpdateUserAttribute = async params => {
		console.log('updateUserAttribute call');
		return undefined as AuthStateFlow;
	};

	updatePreferredMFA: UpdatePreferredMfa = async params => {
		console.log('updatePreferredMFA Call');
		return undefined as AuthStateFlow;
	};

	verifyUserAttribute: VerifyUserAttribute = async params => {
		console.log('verifyUserAttribute Call');
		return undefined as AuthStateFlow;
	};

	confirmVerifyUserAttribute: ConfirmVerifyUserAttribute = async params => {
		console.log('confirmVerifyUserAttribute Call');
		return undefined as AuthStateFlow;
	};

	signIn: SignIn = async params => {
		// const response = await this.initiateAuth({
		// 	ClientId: this.clientId,
		// 	AuthFlow: this.authFlow,
		// });

		// const signInResult: AuthSignInResult = {};
		return undefined as AuthSignInResult;
	};

	signInWithSocialToken: SignInWithSocialToken = async params => {
		console.log('signInWithSocialToken Call');
		return undefined as AuthSignInResult;
	};

	signInWithSocialUI: SignInWithSocialUI = async params => {
		console.log('signInWithSocialUI Call');
		return undefined as AuthSignInResult;
	};

	confirmSignIn: ConfirmSignIn = async params => {
		console.log('confirmSignIn Call');
		return undefined as AuthConfirmSignInResult;
	};

	setupTotp: SetupTotp = async params => {
		console.log('setupTotp Call');
		return undefined as AuthStateFlow;
	};

	verifyTotpToken: VerifyTotpToken = async params => {
		console.log('verifyTotpToken Call');
		return undefined as AuthStateFlow;
	};

	resetPassword: ResetPassword = async params => {
		console.log('resetPassword Call');
		return undefined as AuthStateFlow;
	};

	confirmResetPassword: ConfirmResetPassword = async params => {
		console.log('confirmResetPassword Call');
		return undefined as AuthStateFlow;
	};

	getUser: GetUser = async () => {
		console.log('getUser Call');
		return undefined as AuthUser;
	};

	registerDevice: RegisterDevice = async params => {
		console.log('registerDevice Call');
		return undefined as AuthUser;
	};

	unregisterDevice: UnregisterDevice = async params => {
		console.log('unregisterDevice Call');
		return undefined as AuthUser;
	};

	private initiateAuth = (
		params: InitiateAuthCommandInput
	): Promise<InitiateAuthCommandOutput> => {
		return this.request<InitiateAuthCommandOutput>('InitiateAuth', params);
	};
}
