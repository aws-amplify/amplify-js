/* eslint-disable unused-imports/no-unused-vars */

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CredentialsLocation,
	LocationCredentialsHandler,
	LocationCredentialsStore,
} from '../types';
import { LocationCredentialsProvider } from '../../providers/s3/types/options';

import { createStore, getValue, removeStore } from './registry';

export const createLocationCredentialsStore = (input: {
	handler: LocationCredentialsHandler;
}): LocationCredentialsStore => {
	const storeSymbol = createStore(input.handler);

	const store = {
		getProvider(providerLocation: CredentialsLocation) {
			const locationCredentialsProvider = async ({
				permission,
				locations,
				forceRefresh = false,
			}: Parameters<LocationCredentialsProvider>[0]) => {
				// TODO(@AllanZhengYP) validate input

				return getValue({
					storeSymbol,
					location: { ...providerLocation },
					forceRefresh,
				});
			};

			return locationCredentialsProvider;
		},

		destroy() {
			removeStore(storeSymbol);
		},
	};

	return store;
};
