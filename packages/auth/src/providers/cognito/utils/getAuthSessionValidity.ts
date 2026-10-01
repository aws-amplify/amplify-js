// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

export const DEFAULT_AUTH_SESSION_VALIDITY_MS = 3 * 60 * 1000;
const MIN_AUTH_SESSION_VALIDITY_MS = 3 * 60 * 1000;
const MAX_AUTH_SESSION_VALIDITY_MS = 15 * 60 * 1000;

export const getAuthSessionValidity = (): number => {
	const authSessionValidity =
		Amplify.getConfig().Auth?.Cognito.authSessionValidity;

	if (
		typeof authSessionValidity !== 'number' ||
		!Number.isFinite(authSessionValidity)
	) {
		return DEFAULT_AUTH_SESSION_VALIDITY_MS;
	}

	const authSessionValidityMs = authSessionValidity * 60 * 1000;
	const boundedAuthSessionValidity = Math.min(
		Math.max(authSessionValidityMs, MIN_AUTH_SESSION_VALIDITY_MS),
		MAX_AUTH_SESSION_VALIDITY_MS,
	);

	return boundedAuthSessionValidity;
};
