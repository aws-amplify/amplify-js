// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
	/**
	 * Collects device context data for Cognito ASF
	 * @param userPoolId - The Cognito User Pool ID (e.g., "us-east-1_xxxxx")
	 * @param clientId - The Cognito App Client ID
	 * @returns Encoded context data string or null if unavailable
	 */
	getContextData(userPoolId: string, clientId: string): string | null;
}

// Using get() instead of getEnforcing() to allow graceful fallback when module is not installed
export default TurboModuleRegistry.get<Spec>('AmplifyRtnAsf');
