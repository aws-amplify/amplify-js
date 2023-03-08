import { ClientMetadata } from 'amazon-cognito-identity-js';
import { ValidationData } from '../models/ValidationData';

export type CognitoSignUpOptions = {
	validationData?: ValidationData;
	clientMetadata?: ClientMetadata;
	// autoSignIn?: AutoSignInOptions;
};
