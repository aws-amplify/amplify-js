import { Amplify, parseAWSExports } from '@aws-amplify/core';
import { requestCognitoUserPool } from '../client';

export async function verifyTOTP({ code }) {
	const amplifyConfig = parseAWSExports(Amplify.getConfig()) as any;
	if (amplifyConfig && amplifyConfig.Auth) {
		let Session = '';
		let username = '';
		const context = Amplify.getContext();
		let jsonReq = {
			UserCode: code,
			FriendlyDeviceName: 'my-device',
		};

		if (context.Auth && context.Auth.confirmSignIn) {
			Session = context.Auth.confirmSignIn.Session;
			username = context.Auth.confirmSignIn.username;
			jsonReq['Session'] = Session;
		} else {
			jsonReq['AccessToken'] = Amplify.getUser().accessToken;
		}

		const response = await requestCognitoUserPool({
			operation: 'VerifySoftwareToken',
			region: amplifyConfig.Auth.region,
			params: jsonReq,
		});

		return response;
	}
}
