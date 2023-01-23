import { Amplify, parseAWSExports } from '@aws-amplify/core';
import { requestCognitoUserPool } from '../client';

export async function signUp({ username, password, userAttributes }) {
	const amplifyConfig = parseAWSExports(Amplify.getConfig()) as any;

	if (amplifyConfig && amplifyConfig.Auth) {
		const clientId = amplifyConfig.Auth.userPoolWebClientId;
		const jsonReq = {
			ClientId: clientId,
			Username: username,
			Password: password,
			UserAttributes: userAttributes,
			ValidationData: null,
			ClientMetadata: {},
		};

		const result = await requestCognitoUserPool({
			operation: 'SignUp',
			params: jsonReq,
			region: amplifyConfig.Auth.region,
		});

		return result;
	}
}
