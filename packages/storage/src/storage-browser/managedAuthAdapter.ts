// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	CredentialsProvider,
	ListLocations,
	LocationCredentialsHandler,
} from './types';

export interface ManagedAuthAdapterInput {
	accountId: string;
	region: string;
	credentialsProvider: CredentialsProvider;
}

export interface ManagedAuthAdapterOutput {
	listLocations: ListLocations;
	getLocationCredentials: LocationCredentialsHandler;
	region: string;
}

export const managedAuthAdapter = (
	// eslint-disable-next-line unused-imports/no-unused-vars
	input: ManagedAuthAdapterInput,
): ManagedAuthAdapterOutput => {
	// TODO(@AllanZhengYP)
	throw new Error('Not implemented');
};
