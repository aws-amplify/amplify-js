import { Amplify, parseAWSExports } from '@aws-amplify/core';
import { requestCognitoUserPool } from '../client';

export async function confirmSignIn({ code }) {
	const amplifyConfig = parseAWSExports(Amplify.getConfig()) as any;
	const context = Amplify.getContext();

	if (amplifyConfig && amplifyConfig.Auth) {
		let Session = '';
		let username = '';
		debugger;
		if (context.Auth && context.Auth.confirmSignIn) {
			Session = context.Auth.confirmSign.Session;
			username = context.Auth.confirmSign.username;
		}
		const clientId = amplifyConfig.Auth.userPoolWebClientId;
		const jsonReq = {
			ClientId: clientId,
			Username: username,
			ValidationData: null,
			ChallengeResponses: {
				SMS_MFA_CODE: code,
			},
			Session,
		};

		const result = await requestCognitoUserPool({
			operation: 'RespondToAuthChallenge',
			params: jsonReq,
			region: amplifyConfig.Auth.region,
		});

		return result;
	}
}
