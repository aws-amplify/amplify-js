import {
	NodeCallback,
	UpdateAttributesNodeCallback,
	ClientMetadata,
	IAuthenticationCallback,
	IMfaSettings,
	AuthenticationDetails,
	ICognitoUserData,
	GetSessionOptions,
	ChallengeName,
	CognitoUserSession,
	CognitoRefreshToken,
	CognitoUserAttribute,
	ICognitoUserAttributeData,
	MFAOption,
	UserData,
} from 'amazon-cognito-identity-js';

export const addAuthCategoryToCognitoUserAgent: () => void;
export const addFrameworkToCognitoUserAgent: (content: string) => void;

export class InternalCognitoUser {
	constructor(data: ICognitoUserData);

	challengeName?: ChallengeName;

	public setSignInUserSession(signInUserSession: CognitoUserSession): void;
	public getSignInUserSession(): CognitoUserSession | null;
	public getUsername(): string;

	public getAuthenticationFlowType(): string;
	public setAuthenticationFlowType(authenticationFlowType: string): string;
	public getCachedDeviceKeyAndPassword(): void;

	public getSession(
		callback:
			| ((error: Error, session: null) => void)
			| ((error: null, session: CognitoUserSession) => void),
		options?: GetSessionOptions,
		userAgentValue?: string
	): void;
	public refreshSession(
		refreshToken: CognitoRefreshToken,
		callback: NodeCallback<any, any>,
		clientMetadata?: ClientMetadata,
		userAgentValue?: string
	): void;
	public authenticateUser(
		authenticationDetails: AuthenticationDetails,
		callbacks: IAuthenticationCallback,
		userAgentValue?: string
	): void;
	public initiateAuth(
		authenticationDetails: AuthenticationDetails,
		callbacks: IAuthenticationCallback,
		userAgentValue?: string
	): void;
	public confirmRegistration(
		code: string,
		forceAliasCreation: boolean,
		callback: NodeCallback<any, any>,
		clientMetadata?: ClientMetadata,
		userAgentValue?: string
	): void;
	public sendCustomChallengeAnswer(
		answerChallenge: any,
		callback: IAuthenticationCallback,
		clientMetaData?: ClientMetadata,
		userAgentValue?: string
	): void;
	public resendConfirmationCode(
		callback: NodeCallback<Error, any>,
		clientMetaData?: ClientMetadata,
		userAgentValue?: string
	): void;
	public changePassword(
		oldPassword: string,
		newPassword: string,
		callback: NodeCallback<Error, 'SUCCESS'>,
		clientMetadata?: ClientMetadata,
		userAgentValue?: string
	): void;
	public forgotPassword(
		callbacks: {
			onSuccess: (data: any) => void;
			onFailure: (err: Error) => void;
			inputVerificationCode?: (data: any) => void;
		},
		clientMetaData?: ClientMetadata,
		userAgentValue?: string
	): void;
	public confirmPassword(
		verificationCode: string,
		newPassword: string,
		callbacks: {
			onSuccess: (success: string) => void;
			onFailure: (err: Error) => void;
		},
		clientMetaData?: ClientMetadata,
		userAgentValue?: string
	): void;
	public setDeviceStatusRemembered(
		callbacks: {
			onSuccess: (success: string) => void;
			onFailure: (err: any) => void;
		},
		userAgentValue?: string
	): void;
	public setDeviceStatusNotRemembered(
		callbacks: {
			onSuccess: (success: string) => void;
			onFailure: (err: any) => void;
		},
		userAgentValue?: string
	): void;
	public getDevice(
		callbacks: {
			onSuccess: (success: string) => void;
			onFailure: (err: Error) => void;
		},
		userAgentValue?: string
	): any;
	public forgetDevice(
		callbacks: {
			onSuccess: (success: string) => void;
			onFailure: (err: Error) => void;
		},
		userAgentValue?: string
	): void;
	public forgetSpecificDevice(
		deviceKey: string,
		callbacks: {
			onSuccess: (success: string) => void;
			onFailure: (err: Error) => void;
		},
		userAgentValue?: string
	): void;
	public sendMFACode(
		confirmationCode: string,
		callbacks: {
			onSuccess: (
				session: CognitoUserSession,
				userConfirmationNecessary?: boolean
			) => void;
			onFailure: (err: any) => void;
		},
		mfaType?: string,
		clientMetadata?: ClientMetadata,
		userAgentValue?: string
	): void;
	public listDevices(
		limit: number,
		paginationToken: string | null,
		callbacks: {
			onSuccess: (data: any) => void;
			onFailure: (err: Error) => void;
		},
		userAgentValue?: string
	): void;
	public completeNewPasswordChallenge(
		newPassword: string,
		requiredAttributeData: any,
		callbacks: IAuthenticationCallback,
		clientMetadata?: ClientMetadata,
		userAgentValue?: string
	): void;
	public signOut(callback?: () => void, userAgentValue?: string): void;
	public globalSignOut(
		callbacks: {
			onSuccess: (msg: string) => void;
			onFailure: (err: Error) => void;
		},
		userAgentValue?: string
	): void;
	public verifyAttribute(
		attributeName: string,
		confirmationCode: string,
		callbacks: {
			onSuccess: (success: string) => void;
			onFailure: (err: Error) => void;
		},
		userAgentValue?: string
	): void;
	public getUserAttributes(
		callback: NodeCallback<Error, CognitoUserAttribute[]>,
		userAgentValue?: string
	): void;
	public updateAttributes(
		attributes: (CognitoUserAttribute | ICognitoUserAttributeData)[],
		callback: UpdateAttributesNodeCallback<Error, string, any>,
		clientMetadata?: ClientMetadata,
		userAgentValue?: string
	): void;
	public deleteAttributes(
		attributeList: string[],
		callback: NodeCallback<Error, string>,
		userAgentValue?: string
	): void;
	public getAttributeVerificationCode(
		name: string,
		callback: {
			onSuccess: (success: string) => void;
			onFailure: (err: Error) => void;
			inputVerificationCode?: (data: string) => void | null;
		},
		clientMetadata?: ClientMetadata,
		userAgentValue?: string
	): void;
	public deleteUser(
		callback: NodeCallback<Error, string>,
		userAgentValue?: string
	): void;
	public enableMFA(
		callback: NodeCallback<Error, string>,
		userAgentValue?: string
	): void;
	public disableMFA(
		callback: NodeCallback<Error, string>,
		userAgentValue?: string
	): void;
	public getMFAOptions(
		callback: NodeCallback<Error, MFAOption[]>,
		userAgentValue?: string
	): void;
	public getUserData(
		callback: NodeCallback<Error, UserData>,
		params?: any,
		userAgentValue?: string
	): void;
	public associateSoftwareToken(
		callbacks: {
			associateSecretCode: (secretCode: string) => void;
			onFailure: (err: any) => void;
		},
		userAgentValue?: string
	): void;
	public verifySoftwareToken(
		totpCode: string,
		friendlyDeviceName: string,
		callbacks: {
			onSuccess: (session: CognitoUserSession) => void;
			onFailure: (err: Error) => void;
		},
		userAgentValue?: string
	): void;
	public setUserMfaPreference(
		smsMfaSettings: IMfaSettings | null,
		softwareTokenMfaSettings: IMfaSettings | null,
		callback: NodeCallback<Error, string>,
		userAgentValue?: string
	): void;
	public sendMFASelectionAnswer(
		answerChallenge: string,
		callbacks: {
			onSuccess: (session: CognitoUserSession) => void;
			onFailure: (err: any) => void;
			mfaRequired?: (
				challengeName: ChallengeName,
				challengeParameters: any
			) => void;
			totpRequired?: (
				challengeName: ChallengeName,
				challengeParameters: any
			) => void;
		},
		userAgentValue?: string
	): void;
}
