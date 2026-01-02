// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAmplifyRtnAsf } from '@aws-amplify/react-native';

export function getUserContextData({
	userPoolId,
	userPoolClientId,
}: {
	username: string;
	userPoolId: string;
	userPoolClientId: string;
}): { EncodedData: string } | undefined {
	try {
		const asfModule = loadAmplifyRtnAsf();
		if (!asfModule) {
			return undefined;
		}

		const encodedData = asfModule.getContextData(userPoolId, userPoolClientId);
		if (!encodedData) {
			return undefined;
		}

		return { EncodedData: encodedData };
	} catch {
		return undefined;
	}
}
