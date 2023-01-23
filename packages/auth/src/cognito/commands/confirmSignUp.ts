import { Amplify, parseAWSExports } from '@aws-amplify/core';
import { requestCognitoUserPool } from '../client';

export async function confirmSignUp({ username, confirmationCode }) {
	const amplifyConfig = parseAWSExports(Amplify.getConfig()) as any;

	if (amplifyConfig && amplifyConfig.Auth) {
		const clientId = amplifyConfig.Auth.userPoolWebClientId;
		const jsonReq = {
			ClientId: clientId,
			Username: username,
			ConfirmationCode: confirmationCode,
		};

		const result = await requestCognitoUserPool({
			operation: 'ConfirmSignUp',
			params: jsonReq,
			region: amplifyConfig.Auth.region,
		});

		return result;
	}
}
