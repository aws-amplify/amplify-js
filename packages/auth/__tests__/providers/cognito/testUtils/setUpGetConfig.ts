// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const setUpGetConfig = (mockAmplify: any) => {
	mockAmplify.getConfig.mockReturnValue({
		Auth: {
			Cognito: {
				userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
				identityPoolId: 'us-west-2:xxxxxx',
			},
		},
	});
};
