// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// export const identifyUser = async ({
// 	userId,
// 	userProfile,
// 	options,
// }: IdentifyUserInput): Promise<void> => {
// 	const { credentials, identityId } = await resolveCredentials();
// 	const { appId, region } = resolveConfig();
// 	const { address, optOut, userAttributes } = options?.serviceOptions ?? {};
// 	updateEndpoint({
// 		address,
// 		appId,
// 		category: 'Analytics',
// 		credentials,
// 		identityId,
// 		optOut,
// 		region,
// 		userAttributes,
// 		userId,
// 		userProfile,
// 		userAgentValue: getAnalyticsUserAgentString(AnalyticsAction.UpdateEndpoint),
// 	});
// };
