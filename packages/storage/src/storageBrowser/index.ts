// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { LocationCredentialsProvider } from '../providers/s3/types/options';
export { StorageSubpathStrategy } from '../types/options';

export { createLocationCredentialsStore } from './locationCredentialsStore';
export {
	AuthConfigAdapter,
	createManagedAuthConfigAdapter,
	CreateManagedAuthConfigAdapterInput,
} from './managedAuthConfigAdapter';
export {
	GetLocationCredentials,
	ListLocations,
	LocationCredentialsStore,
} from './types';
