import {
	SignUpCommandInput,
	SignUpCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { Amplify } from '@aws-amplify/core';
import { UserPoolHttpClient } from './CognitoClients';

type SignUpClientInput = Partial<SignUpCommandInput> &
	Pick<SignUpCommandInput, 'Username'>;

export const userpoolClient = {
	signUp: async (params: SignUpCommandInput): Promise<SignUpCommandOutput> => {
		const region = Amplify.config.region;
		const client = new UserPoolHttpClient(region);
		return await client.send<SignUpCommandOutput>('SignUp', params);
	},
};
