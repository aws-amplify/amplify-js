import { UniversalStorage } from '@aws-amplify/core';

// ! We have to use this exact reference, since it gets mutated with Amplify.Auth
import { Amplify } from './index';

type Context = {
	awsConfig: any; // Todo type this
	req?: any;
};

export function withFunctionalSSRContext(context: Context): void {
	const { awsConfig, req } = context;
	const storage = new UniversalStorage({ req });
	const ssrConfig = {
		...awsConfig,
		storage,
	};

	// Configure global Amplify config in SSR context
	Amplify.configure(ssrConfig);

	// Load tokens from universal storage & set Amplify user
	// NOTE Functional APIs currently use `username` for all users when storing tokens
	/*const userPoolId = awsConfig['aws_user_pools_web_client_id'];
	const idToken = storage.getItem(`CognitoIdentityServiceProvider.${userPoolId}.username.idToken`);
	const accessToken = storage.getItem(`CognitoIdentityServiceProvider.${userPoolId}.username.accessToken`);
	const refreshToken = storage.getItem(`CognitoIdentityServiceProvider.${userPoolId}.username.refreshToken`);
	const amplifyUser = {
		idToken: idToken,
		accessToken: accessToken,
		isSignedIn: true,
		refreshToken: refreshToken,
	};

	Amplify.setUser(amplifyUser);*/
}
