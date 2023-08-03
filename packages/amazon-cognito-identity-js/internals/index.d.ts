import {
	NodeCallback,
	ClientMetadata,
	CognitoUser,
	CognitoUserAttribute,
	ICognitoUserPoolData,
	ISignUpResult,
} from 'amazon-cognito-identity-js';

export const addAuthCategoryToCognitoUserAgent: () => void;
export const addFrameworkToCognitoUserAgent: (content: string) => void;

export class InternalCognitoUserPool {
	constructor(
		data: ICognitoUserPoolData,
		wrapRefreshSessionCallback?: (target: NodeCallback.Any) => NodeCallback.Any
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
		clientMetadata?: ClientMetadata,
		userAgentValue?: string
	): void;

	public getCurrentUser(): CognitoUser | null;
}
