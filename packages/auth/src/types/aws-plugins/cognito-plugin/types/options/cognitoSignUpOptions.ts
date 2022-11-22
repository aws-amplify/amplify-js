import { ClientMetadata, ValidationData } from '../models'

export type CognitoSignUpOptions = {
	validationData?: ValidationData;
	clientMetaData?: ClientMetadata;
}