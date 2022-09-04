import { SignUpParams } from 'src/types/model/signup/SignUpParams';

export type CognitoSignUpParams = SignUpParams & {
	validationData?: { [key: string]: any };
	clientMetadata?: { [key: string]: string };
};
