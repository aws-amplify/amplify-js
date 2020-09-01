import { AuthSignUpOptions, AuthSignUpResult } from './common';

// // PREVIOUS:
// export interface SignUpParams {
// 	username: string;
// 	password: string;
// 	attributes?: object;
// 	validationData?: CognitoUserAttribute[];
// 	clientMetadata?: { [key: string]: string };
// }

export interface SignUpParams {
	username: string;
	password?: string;
	options?: AuthSignUpOptions;
}

export type SignUp = (params: SignUpParams) => Promise<AuthSignUpResult>;
