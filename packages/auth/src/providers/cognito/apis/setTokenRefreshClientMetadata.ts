// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { tokenOrchestrator } from '../tokenProvider';
import type { ClientMetadata } from '../types';

/**
 * Sets global client metadata for token refresh operations.
 * This metadata will be included in all subsequent token refresh requests.
 *
 * @param clientMetadata - Optional metadata to include with token refresh requests
 */
export function setTokenRefreshClientMetadata(
	clientMetadata?: ClientMetadata,
): void {
	tokenOrchestrator.setTokenRefreshClientMetadata(clientMetadata);
}
