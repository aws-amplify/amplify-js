// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export function getUserContextData({
	username,
	userPoolId,
	userPoolClientId,
}: {
	username: string;
	userPoolId: string;
	userPoolClientId: string;
}) {
	if (typeof window === 'undefined') {
		return undefined;
	}

	const amazonCognitoAdvancedSecurityData = (window as any)
		.AmazonCognitoAdvancedSecurityData as any;
	if (typeof amazonCognitoAdvancedSecurityData === 'undefined') {
		return undefined;
	}

	const advancedSecurityData = amazonCognitoAdvancedSecurityData.getData(
		username,
		userPoolId,
		userPoolClientId,
	);

	if (advancedSecurityData) {
		const userContextData = {
			EncodedData: advancedSecurityData,
		};

		return userContextData;
	}

	return {};
}
