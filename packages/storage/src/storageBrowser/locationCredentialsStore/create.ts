// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CreateLocationCredentialsStoreInput,
	CredentialsLocation,
	LocationCredentialsStore,
} from '../types';
import { StorageValidationErrorCode } from '../../errors/types/validation';
import { assertValidationError } from '../../errors/utils/assertValidationError';
import { LocationCredentialsProvider } from '../../providers/s3/types/options';

import { createStore, getValue, removeStore } from './registry';

export const createLocationCredentialsStore = (
	input: CreateLocationCredentialsStoreInput,
): LocationCredentialsStore => {
	const storeSymbol = createStore(input.handler);

	const store = {
		getProvider(providerLocation: CredentialsLocation) {
			const locationCredentialsProvider = async ({
				forceRefresh = false,
			}: Parameters<LocationCredentialsProvider>[0] = {}) => {
				validateS3Uri(providerLocation.scope);

				// TODO(@AllanZhengYP): validate the action bucket and paths matches provider scope.
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

type S3Uri = string;

const validateS3Uri = (uri: S3Uri): void => {
	const s3UrlSchemaRegex = /^s3:\/\/[^/]+/;
	assertValidationError(
		s3UrlSchemaRegex.test(uri),
		StorageValidationErrorCode.InvalidS3Uri,
	);
};
