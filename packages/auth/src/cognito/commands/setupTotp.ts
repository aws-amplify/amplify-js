import { Amplify, parseAWSExports } from '@aws-amplify/core';
import { requestCognitoUserPool } from '../client';

export async function setupTOTP() {
	const amplifyConfig = parseAWSExports(Amplify.getConfig()) as any;
	if (amplifyConfig && amplifyConfig.Auth) {
		let Session = '';
		let username = '';
		let jsonReq = {};
		const context = Amplify.getContext();

		if (context.Auth && context.Auth.confirmSignIn) {
			Session = context.Auth.confirmSignIn.Session;
			username = context.Auth.confirmSignIn.username;
			jsonReq = {
				Session,
			};
		} else {
			jsonReq = {
				AccessToken: Amplify.getUser().accessToken,
			};
		}

		const response = await requestCognitoUserPool({
			operation: 'AssociateSoftwareToken',
			region: amplifyConfig.Auth.region,
			params: jsonReq,
		});

		const { SecretCode } = response;

		console.log({ SecretCode });
	}
}
