import { AmplifyContext, ResourcesConfig } from '@aws-amplify/core';

export function createMockAmplifyContext(
	resourcesConfig: ResourcesConfig = {},
): AmplifyContext {
	return {
		resourcesConfig,
		libraryOptions: {},
		fetchAuthSession: jest.fn().mockResolvedValue({}),
		clearCredentials: jest.fn().mockResolvedValue(undefined),
		getTokens: jest.fn().mockResolvedValue(undefined),
	};
}
