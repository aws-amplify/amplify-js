import { Amplify } from '@aws-amplify/core';
import { AuthStandardAttributeKey, SignUpRequest } from '../../../types';
import { AuthSignUpResult } from '../../../types/results/AuthSignUpResult';
import { CognitoUserAttributeKey } from '../types/models/CognitoUserAttributeKey';
import { CustomAttribute } from '../types/models/CustomAttribute';
import { CognitoSignUpOptions } from '../types/options/CognitoSignUpOptions';
import { userpoolClient } from '../client/UserPoolClient';

export async function signUp(
	req: SignUpRequest<CognitoUserAttributeKey, CognitoSignUpOptions>
): Promise<AuthSignUpResult<AuthStandardAttributeKey | CustomAttribute>> {
	const res = await userpoolClient.signUp({});
	return await {
		isSignUpComplete: true,
		nextStep: {},
	};
}
