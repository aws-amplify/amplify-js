import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql';
import { AuthModeStrategy } from '../types';

// TODO
export const multiAuthStrategy: AuthModeStrategy = async ({
	modelName,
	operation,
}) => {
	return [
		GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
		GRAPHQL_AUTH_MODE.API_KEY,
	];
};
