import { AmplifyContext } from '@aws-amplify/core';

export function createMockAmplifyContext(
	resourcesConfig: Record<string, unknown> = {},
	fetchAuthSessionValue: Record<string, unknown> = {},
): AmplifyContext {
	return {
		resourcesConfig,
		libraryOptions: {},
		fetchAuthSession: jest.fn().mockResolvedValue(fetchAuthSessionValue),
		clearCredentials: jest.fn().mockResolvedValue(undefined),
		getTokens: jest.fn().mockResolvedValue(undefined),
	} as unknown as AmplifyContext;
}
