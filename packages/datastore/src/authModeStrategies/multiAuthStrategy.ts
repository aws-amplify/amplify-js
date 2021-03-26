import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql';
import { AuthModeStrategy } from '../types';

// TODO: use schema to determine priority of each auth mode
export const multiAuthStrategy: AuthModeStrategy = async ({
	schema,
	modelName,
	operation,
}) => {
	return [
		GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
		GRAPHQL_AUTH_MODE.AWS_IAM,
		GRAPHQL_AUTH_MODE.API_KEY,
	];
};
