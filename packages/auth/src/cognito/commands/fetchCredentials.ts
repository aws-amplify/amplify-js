import { Amplify, parseAWSExports } from '@aws-amplify/core';
import { requestCognitoIdentityPool, requestCognitoUserPool } from '../client';

export async function fetchCredentials(token: string) {
	console.log(`getting credentials... ${token}`);
	const amplifyConfig = parseAWSExports(Amplify.getConfig()) as any;

	if (amplifyConfig && amplifyConfig.Auth) {
		const region = amplifyConfig.Auth.region;
		const userPoolId = amplifyConfig.Auth.userPoolId;
		const identityPoolId = amplifyConfig.Auth.identityPoolId;

		const responseId = await requestCognitoIdentityPool({
			operation: 'GetId',
			params: {
				IdentityPoolId: identityPoolId,
				Logins: {
					[`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: token,
				},
			},
			region,
		});

		const responseCreds = await requestCognitoIdentityPool({
			operation: 'GetCredentialsForIdentity',
			params: {
				IdentityPoolId: identityPoolId,
				Logins: {
					[`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: token,
				},
				IdentityId: responseId.IdentityId,
			},
			region,
		});

		console.log({ responseCreds });
		return {
			accessKey: responseCreds.AccessKeyId,
			secretKey: responseCreds.SecretKey,
			sessionToken: responseCreds.SessionToken,
			identityId: responseId.IdentityId,
		};
	} else {
		return {
			accessKey: '',
			secretKey: '',
			sessionToken: '',
			identityId: '',
		};
	}
}
