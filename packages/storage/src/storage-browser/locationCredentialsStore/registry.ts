/* eslint-disable unused-imports/no-unused-vars */

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AWSCredentials } from '@aws-amplify/core/internals/utils';

import { CredentialsLocation, LocationCredentialsHandler } from '../types';

import { LocationCredentialsStore, initStore } from './store';

/**
 * Keep all cache records for all instances of credentials store in a singleton
 * so we can reliably de-reference from the memory when we destroy a store
 * instance.
 */
const storeRegistry = new Map<symbol, LocationCredentialsStore>();

export const createStore = (
	refreshHandler: LocationCredentialsHandler,
	size?: number,
) => {
	const storeInstanceSymbol = Symbol('LocationCredentialsStore');
	storeRegistry.set(storeInstanceSymbol, initStore(refreshHandler, size));

	return storeInstanceSymbol;
};

export const getValue = async (input: {
	storeReference: symbol;
	location: CredentialsLocation;
	forceRefresh: boolean;
}): Promise<{ credentials: AWSCredentials }> => {
	// TODO(@AllanZhengYP): get location credentials from store.
	throw new Error('Not implemented');
};

export const removeStore = (storeReference: symbol) => {
	storeRegistry.delete(storeReference);
};
