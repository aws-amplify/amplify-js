// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * NOTE: The APIs exported from this file are ONLY intended for usage by
 * Amplify UI. To use location-related features, please use
 * @aws-amplify/ui-react-storage
 */

export {
	listCallerAccessGrants,
	ListCallerAccessGrantsInput,
	ListCallerAccessGrantsOutput,
} from './listCallerAccessGrants';
export { createLocationCredentialsHandler } from './createLocationCredentialsHandler';
export { createLocationCredentialsStore } from './locationCredentialsStore';
export {
	createManagedAuthAdapter as managedAuthAdapter,
	ManagedAuthAdapterInput,
} from './managedAuthAdapter';
