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
}
