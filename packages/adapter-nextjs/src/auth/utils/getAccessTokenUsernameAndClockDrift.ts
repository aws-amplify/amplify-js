// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeJWT } from '@aws-amplify/core';

export const getAccessTokenUsernameAndClockDrift = (
	accessToken: string,
): {
	username: string;
	clockDrift: number;
} => {
	const decoded = decodeJWT(accessToken);
	const issuedAt = (decoded.payload.iat ?? 0) * 1000;
	const clockDrift = issuedAt > 0 ? issuedAt - Date.now() : 0;
	const username = (decoded.payload.username as string) ?? 'username';

	return {
		username,
		clockDrift,
	};
};
