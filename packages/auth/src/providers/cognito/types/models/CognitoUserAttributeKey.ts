import { AuthStandardAttributeKey } from '../../../../types/models/AuthStandardAttributeKey';
import { CustomAttribute } from './CustomAttribute';

export type CognitoUserAttributeKey =
	| AuthStandardAttributeKey
	| CustomAttribute;
