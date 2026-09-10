declare module 'amazon-cognito-identity-js' {
	//import * as AWS from "aws-sdk";

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export type NodeCallback<E, T> = (err?: E, result?: T) => void;
	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export type UpdateAttributesNodeCallback<E, T, K> = (
		err?: E,
		result?: T,
		details?: K
	) => void;
	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export namespace NodeCallback {
		export type Any = NodeCallback<Error | undefined, any>;
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export interface CodeDeliveryDetails {
		AttributeName: string;
		DeliveryMedium: string;
		Destination: string;
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export type ClientMetadata = { [key: string]: string } | undefined;

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export interface IAuthenticationCallback {
		onSuccess: (
			session: CognitoUserSession,
			userConfirmationNecessary?: boolean
		) => void;
		onFailure: (err: any) => void;
		newPasswordRequired?: (
			userAttributes: any,
			requiredAttributes: any
		) => void;
		mfaRequired?: (
			challengeName: ChallengeName,
			challengeParameters: any
		) => void;
		totpRequired?: (
			challengeName: ChallengeName,
			challengeParameters: any
		) => void;
		customChallenge?: (challengeParameters: any) => void;
		mfaSetup?: (challengeName: ChallengeName, challengeParameters: any) => void;
		selectMFAType?: (
			challengeName: ChallengeName,
			challengeParameters: any
		) => void;
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export interface IMfaSettings {
		PreferredMfa: boolean;
		Enabled: boolean;
	}
	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export interface IAuthenticationDetailsData {
		Username: string;
		Password?: string;
		ValidationData?: { [key: string]: any };
		ClientMetadata?: ClientMetadata;
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export class AuthenticationDetails {
		constructor(data: IAuthenticationDetailsData);

		public getUsername(): string;
		public getPassword(): string;
		public getValidationData(): any[];
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export interface ICognitoStorage {
		setItem(key: string, value: string): void;
		getItem(key: string): string | null;
		removeItem(key: string): void;
		clear(): void;
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export interface ICognitoUserData {
		Username: string;
		Pool: CognitoUserPool;
		Storage?: ICognitoStorage;
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export interface GetSessionOptions {
		clientMetadata: Record<string, string>;
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export type ChallengeName =
		| 'CUSTOM_CHALLENGE'
		| 'MFA_SETUP'
		| 'NEW_PASSWORD_REQUIRED'
		| 'SELECT_MFA_TYPE'
		| 'SMS_MFA'
		| 'SOFTWARE_TOKEN_MFA';

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export class CognitoUser {
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
			options?: GetSessionOptions
		): void;
		public refreshSession(
			refreshToken: CognitoRefreshToken,
			callback: NodeCallback<any, any>,
			clientMetadata?: ClientMetadata
		): void;
		public authenticateUser(
			authenticationDetails: AuthenticationDetails,
			callbacks: IAuthenticationCallback
		): void;
		public initiateAuth(
			authenticationDetails: AuthenticationDetails,
			callbacks: IAuthenticationCallback
		): void;
		public confirmRegistration(
			code: string,
			forceAliasCreation: boolean,
			callback: NodeCallback<any, any>,
			clientMetadata?: ClientMetadata
		): void;
		public sendCustomChallengeAnswer(
			answerChallenge: any,
			callback: IAuthenticationCallback,
			clientMetaData?: ClientMetadata
		): void;
		public resendConfirmationCode(
			callback: NodeCallback<Error, any>,
			clientMetaData?: ClientMetadata
		): void;
		public changePassword(
			oldPassword: string,
			newPassword: string,
			callback: NodeCallback<Error, 'SUCCESS'>,
			clientMetadata?: ClientMetadata
		): void;
		public forgotPassword(
			callbacks: {
				onSuccess: (data: any) => void;
				onFailure: (err: Error) => void;
				inputVerificationCode?: (data: any) => void;
			},
			clientMetaData?: ClientMetadata
		): void;
		public confirmPassword(
			verificationCode: string,
			newPassword: string,
			callbacks: {
				onSuccess: (success: string) => void;
				onFailure: (err: Error) => void;
			},
			clientMetaData?: ClientMetadata
		): void;
		public setDeviceStatusRemembered(callbacks: {
			onSuccess: (success: string) => void;
			onFailure: (err: any) => void;
		}): void;
		public setDeviceStatusNotRemembered(callbacks: {
			onSuccess: (success: string) => void;
			onFailure: (err: any) => void;
		}): void;
		public getDevice(callbacks: {
			onSuccess: (success: string) => void;
			onFailure: (err: Error) => void;
		}): any;
		public forgetDevice(callbacks: {
			onSuccess: (success: string) => void;
			onFailure: (err: Error) => void;
		}): void;
		public forgetSpecificDevice(
			deviceKey: string,
			callbacks: {
				onSuccess: (success: string) => void;
				onFailure: (err: Error) => void;
			}
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
			clientMetadata?: ClientMetadata
		): void;
		public listDevices(
			limit: number,
			paginationToken: string | null,
			callbacks: {
				onSuccess: (data: any) => void;
				onFailure: (err: Error) => void;
			}
		): void;
		public completeNewPasswordChallenge(
			newPassword: string,
			requiredAttributeData: any,
			callbacks: IAuthenticationCallback,
			clientMetadata?: ClientMetadata
		): void;
		public signOut(callback?: () => void): void;
		public globalSignOut(callbacks: {
			onSuccess: (msg: string) => void;
			onFailure: (err: Error) => void;
		}): void;
		public verifyAttribute(
			attributeName: string,
			confirmationCode: string,
			callbacks: {
				onSuccess: (success: string) => void;
				onFailure: (err: Error) => void;
			}
		): void;
		public getUserAttributes(
			callback: NodeCallback<Error, CognitoUserAttribute[]>
		): void;
		public updateAttributes(
			attributes: (CognitoUserAttribute | ICognitoUserAttributeData)[],
			callback: UpdateAttributesNodeCallback<Error, string, any>,
			clientMetadata?: ClientMetadata
		): void;
		public deleteAttributes(
			attributeList: string[],
			callback: NodeCallback<Error, string>
		): void;
		public getAttributeVerificationCode(
			name: string,
			callback: {
				onSuccess: (success: string) => void;
				onFailure: (err: Error) => void;
				inputVerificationCode?: (data: string) => void | null;
			},
			clientMetadata?: ClientMetadata
		): void;
		public deleteUser(callback: NodeCallback<Error, string>): void;
		public enableMFA(callback: NodeCallback<Error, string>): void;
		public disableMFA(callback: NodeCallback<Error, string>): void;
		public getMFAOptions(callback: NodeCallback<Error, MFAOption[]>): void;
		public getUserData(
			callback: NodeCallback<Error, UserData>,
			params?: any
		): void;
		public associateSoftwareToken(callbacks: {
			associateSecretCode: (secretCode: string) => void;
			onFailure: (err: any) => void;
		}): void;
		public verifySoftwareToken(
			totpCode: string,
			friendlyDeviceName: string,
			callbacks: {
				onSuccess: (session: CognitoUserSession) => void;
				onFailure: (err: Error) => void;
			}
		): void;
		public setUserMfaPreference(
			smsMfaSettings: IMfaSettings | null,
			softwareTokenMfaSettings: IMfaSettings | null,
			callback: NodeCallback<Error, string>
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
			}
		): void;
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export interface MFAOption {
		DeliveryMedium: 'SMS' | 'EMAIL';
		AttributeName: string;
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export interface UserData {
		MFAOptions: MFAOption[];
		PreferredMfaSetting: string;
		UserAttributes: ICognitoUserAttributeData[];
		UserMFASettingList: string[];
		Username: string;
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export interface ICognitoUserAttributeData {
		Name: string;
		Value: string;
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export class CognitoUserAttribute implements ICognitoUserAttributeData {
		constructor(data: ICognitoUserAttributeData);

		Name: string;
		Value: string;

		public getValue(): string;
		public setValue(value: string): CognitoUserAttribute;
		public getName(): string;
		public setName(name: string): CognitoUserAttribute;
		public toString(): string;
		public toJSON(): Object;
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export interface ISignUpResult {
		user: CognitoUser;
		userConfirmed: boolean;
		userSub: string;
		codeDeliveryDetails: CodeDeliveryDetails;
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export interface ICognitoUserPoolData {
		UserPoolId: string;
		ClientId: string;
		endpoint?: string;
		Storage?: ICognitoStorage;
		AdvancedSecurityDataCollectionFlag?: boolean;
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export class CognitoUserPool {
		constructor(
			data: ICognitoUserPoolData,
			wrapRefreshSessionCallback?: (
				target: NodeCallback.Any
			) => NodeCallback.Any
		);

		public getUserPoolId(): string;
		public getUserPoolName(): string;
		public getClientId(): string;

		public signUp(
			username: string,
			password: string,
			userAttributes: CognitoUserAttribute[],
			validationData: CognitoUserAttribute[],
			callback: NodeCallback<Error, ISignUpResult>,
			clientMetadata?: ClientMetadata
		): void;

		public getCurrentUser(): CognitoUser | null;
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export interface ICognitoUserSessionData {
		IdToken: CognitoIdToken;
		AccessToken: CognitoAccessToken;
		RefreshToken?: CognitoRefreshToken;
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export class CognitoUserSession {
		constructor(data: ICognitoUserSessionData);

		public getIdToken(): CognitoIdToken;
		public getRefreshToken(): CognitoRefreshToken;
		public getAccessToken(): CognitoAccessToken;
		public isValid(): boolean;
	}
	/*
    export class CognitoIdentityServiceProvider {
        public config: AWS.CognitoIdentityServiceProvider.Types.ClientConfiguration;
    }
    */
	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export class CognitoAccessToken {
		payload: { [key: string]: any };

		constructor({ AccessToken }: { AccessToken: string });

		public getJwtToken(): string;
		public getExpiration(): number;
		public getIssuedAt(): number;
		public decodePayload(): { [id: string]: any };
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export class CognitoIdToken {
		payload: { [key: string]: any };

		constructor({ IdToken }: { IdToken: string });

		public getJwtToken(): string;
		public getExpiration(): number;
		public getIssuedAt(): number;
		public decodePayload(): { [id: string]: any };
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export class CognitoRefreshToken {
		constructor({ RefreshToken }: { RefreshToken: string });

		public getToken(): string;
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export interface ICookieStorageData {
		domain?: string;
		path?: string;
		expires?: number;
		secure?: boolean;
		sameSite?: 'strict' | 'lax' | 'none';
	}
	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export class CookieStorage implements ICognitoStorage {
		constructor(data?: ICookieStorageData);
		setItem(key: string, value: string): void;
		getItem(key: string): string;
		removeItem(key: string): void;
		clear(): void;
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export class UserAgent {
		constructor();
	}

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export const appendToCognitoUserAgent: (content: string) => void;

	/**
	 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
	 * See the migration guide:
	 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
	 */
	export class WordArray {
		constructor(words?: string[], sigBytes?: number);
		random(nBytes: number): WordArray;
		toString(): string;
	}
}
