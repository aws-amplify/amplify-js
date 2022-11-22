import { AuthFlowType, ClientMetadata } from '../models';

export type CognitoSignInOptions = {
	authFlowType: AuthFlowType;
	clientMetadata?: ClientMetadata
}