declare module "amazon-cognito-identity-js" {

    //import * as AWS from "aws-sdk";

    export type NodeCallback<E,T> = (err?: E, result?: T) => void;

    export interface IAuthenticationDetailsData {
        Username: string;
        Password: string;
    }

    export class AuthenticationDetails {
        constructor(data: IAuthenticationDetailsData);

        public getUsername(): string;
        public getPassword(): string;
        public getValidationData(): any[];
    }

    export interface ICognitoStorage {
        setItem(key: string, value: string): void;
        getItem(key: string): string;
        removeItem(key: string): void;
        clear(): void;
    }

    export interface ICognitoUserData {
        Username: string;
        Pool: CognitoUserPool;
        Storage?: ICognitoStorage;
    }

    export class CognitoUser {
        constructor(data: ICognitoUserData);

        public setSignInUserSession(signInUserSession: CognitoUserSession): void;
        public getSignInUserSession(): CognitoUserSession | null;
        public getUsername(): string;

        public getAuthenticationFlowType(): string;
        public setAuthenticationFlowType(authenticationFlowType: string): string;

        public getSession(callback: Function): any;
        public refreshSession(refreshToken: CognitoRefreshToken, callback: NodeCallback<any, any>): void;
        public authenticateUser(authenticationDetails: AuthenticationDetails,
                                callbacks: {
                                    onSuccess: (session: CognitoUserSession, userConfirmationNecessary?: boolean) => void,
                                    onFailure: (err: any) => void,
                                    newPasswordRequired?: (userAttributes: any, requiredAttributes: any) => void,
                                    mfaRequired?: (challengeName: any, challengeParameters: any) => void,
                                    totpRequired?: (challengeName: any, challengeParameters: any) => void,
                                    customChallenge?: (challengeParameters: any) => void,
                                    mfaSetup?: (challengeName: any, challengeParameters: any) => void,
                                    selectMFAType?: (challengeName: any, challengeParameters: any) => void
                                }): void;
        public confirmRegistration(code: string, forceAliasCreation: boolean, callback: NodeCallback<any, any>): void;
        public sendCustomChallengeAnswer(answerChallenge: any, callback:NodeCallback<any, any>):void;
        public resendConfirmationCode(callback: NodeCallback<Error, "SUCCESS">): void;
        public changePassword(oldPassword: string, newPassword: string, callback: NodeCallback<Error, "SUCCESS">): void;
        public forgotPassword(callbacks: { onSuccess: (data: any) => void, onFailure: (err: Error) => void, inputVerificationCode?: (data: any) => void }): void;
        public confirmPassword(verificationCode: string, newPassword: string, callbacks: { onSuccess: () => void, onFailure: (err: Error) => void }): void;
        public setDeviceStatusRemembered(callbacks: { onSuccess: (success: string) => void, onFailure: (err: any) => void }): void;
        public setDeviceStatusNotRemembered(callbacks: { onSuccess: (success: string) => void, onFailure: (err: any) => void }): void;
        public getDevice(callbacks: {onSuccess: (success: string) => void, onFailure: (err: Error) => void}): any;
        public forgetDevice(callbacks: {onSuccess: (success: string) => void, onFailure: (err: Error) => void}): void;
        public forgetSpecificDevice(deviceKey: string, callbacks: {onSuccess: (success: string) => void, onFailure: (err: Error) => void}): void;
        public sendMFACode(confirmationCode: string, callbacks: { onSuccess: (session: CognitoUserSession) => void, onFailure: (err: any) => void }, mfaType?: string): void;
        public listDevices(limit: number, paginationToken: string, callbacks: {onSuccess: (data: any) => void, onFailure: (err: Error) => void}): void;
        public completeNewPasswordChallenge(newPassword: string,
                                            requiredAttributeData: any,
                                            callbacks: {
                                                onSuccess: (session: CognitoUserSession) => void,
                                                onFailure: (err: any) => void,
                                                mfaRequired?: (challengeName: any, challengeParameters: any) => void,
                                                customChallenge?: (challengeParameters: any) => void
                                            }): void;
        public signOut(): void;
        public globalSignOut(callbacks: { onSuccess: (msg: string) => void, onFailure: (err: Error) => void }): void;
        public verifyAttribute(attributeName: string, confirmationCode: string, callbacks: { onSuccess: (success: string) => void, onFailure: (err: Error) => void }): void;
        public getUserAttributes(callback: NodeCallback<Error, CognitoUserAttribute[]>): void;
        public updateAttributes(attributes: ICognitoUserAttributeData[], callback: NodeCallback<Error,string>): void;
        public deleteAttributes(attributeList: string[], callback: NodeCallback<Error, string>): void;
        public getAttributeVerificationCode(name: string, callback: { onSuccess: () => void, onFailure: (err: Error) => void, inputVerificationCode: (data: string) => void | null }): void;
        public deleteUser(callback: NodeCallback<Error, string>): void;
        public enableMFA(callback: NodeCallback<Error, string>): void;
        public disableMFA(callback: NodeCallback<Error, string>): void;
        public getMFAOptions(callback: NodeCallback<Error, MFAOption[]>): void;
        public getUserData(callback: NodeCallback<Error, UserData>): void;
        public associateSoftwareToken(
            callbacks: {
                associateSecretCode: (secretCode: string) => void,
                onFailure: (err: any) => void
            }): void;
        public verifySoftwareToken(totpCode: string, friendlyDeviceName: string, callbacks: {onSuccess: (session: CognitoUserSession) => void, onFailure: (err: Error) => void}): void;
    }

    export interface MFAOption {
        DeliveryMedium: "SMS" |"EMAIL";
        AttributeName: string;
    }

    export interface UserData {
        MFAOptions: MFAOption[];
        PreferredMfaSetting: string;
        UserAttributes: ICognitoUserAttributeData[];
        UserMFASettingList: string[];
        Username: string;
    }
    
    export interface ICognitoUserAttributeData {
        Name: string;
        Value: string;
    }

    export class CognitoUserAttribute {
        constructor(data: ICognitoUserAttributeData);

        public getValue(): string;
        public setValue(value: string): CognitoUserAttribute;
        public getName(): string;
        public setName(name: string): CognitoUserAttribute;
        public toString(): string;
        public toJSON(): Object;
    }

    export interface ISignUpResult {
        user: CognitoUser;
        userConfirmed: boolean;
        userSub: string;
    }

    export interface ICognitoUserPoolData {
        UserPoolId: string;
        ClientId: string;
        endpoint?: string;
        Storage?: ICognitoStorage;
    }

    export class CognitoUserPool {
        constructor(data: ICognitoUserPoolData);

        public getUserPoolId(): string;
        public getClientId(): string;

        public signUp(username: string, password: string, userAttributes: CognitoUserAttribute[], validationData: CognitoUserAttribute[], callback: NodeCallback<Error,ISignUpResult>): void;

        public getCurrentUser(): CognitoUser | null;
    }

    export interface ICognitoUserSessionData {
        IdToken: CognitoIdToken;
        AccessToken: CognitoAccessToken;
        RefreshToken?: CognitoRefreshToken;
    }

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
    export class CognitoAccessToken {
        constructor({ AccessToken }: { AccessToken: string });

        public getJwtToken(): string;
        public getExpiration(): number;
        public getIssuedAt(): number;
        public decodePayload(): { [id: string]: any; }
    }

    export class CognitoIdToken {
        constructor({ IdToken }: { IdToken: string });

        public getJwtToken(): string;
        public getExpiration(): number;
        public getIssuedAt(): number;
        public decodePayload(): { [id: string]: any; }
    }

    export class CognitoRefreshToken {
        constructor({ RefreshToken }: { RefreshToken: string });

        public getToken(): string;
    }

    export interface ICookieStorageData {
        domain: string;
        path?: string;
        expires?: number;
        secure?: boolean;
    }
    export class CookieStorage implements ICognitoStorage {
        constructor(data: ICookieStorageData);
        setItem(key: string, value: string): void;
        getItem(key: string): string;
        removeItem(key: string): void;
        clear(): void;
    }
}
