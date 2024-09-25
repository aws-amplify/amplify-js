// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify } from '@aws-amplify/core';

import {
	GetLocationCredentials,
	ListLocations,
	ListLocationsInput,
	ListLocationsOutput,
} from '../types';

export interface AuthConfigAdapter {
	/** outputs Scope(path), permission (read/write/readwrite), type(prefix/bucket/object) */
	listLocations: ListLocations;
	/** basically fetch auth session */
	getLocationCredentials?: GetLocationCredentials;
}

export const createAmplifyAuthConfigAdapter = (): AuthConfigAdapter => {
	const listLocations = createAmplifyListLocationsHandler();

	return { listLocations };
};

const createAmplifyListLocationsHandler = (): ListLocations => {
	return async function listLocations(input = {}) {
		const { Storage } = Amplify.getConfig();
		const { paths } = Storage!.S3!;

		const { pageSize, nextToken } = input;

		if (pageSize) {
			if (nextToken) {
				const start = -nextToken;
				const end = start > pageSize ? start + pageSize : undefined;

				return {
					locations: paths.slice(start, end),
					nextToken: end ? `${end}` : undefined,
				};
			}

			return {
				locations: paths.slice(0, pageSize),
				nextToken: `${pageSize}`,
			};
		}

		return {
			locations: paths,
		};
	};
};

// eslint-disable-next-line unused-imports/no-unused-vars
const listPathsForUser = (input: ListLocationsInput): ListLocationsOutput => {
	const { Storage } = Amplify.getConfig();
	const { paths } = Storage!.S3!;
	const { pageSize, nextToken } = input;

	if (pageSize) {
		if (nextToken) {
			const start = -nextToken;
			const end = start > pageSize ? start + pageSize : undefined;

			return {
				locations: paths.slice(start, end),
				nextToken: end ? `${end}` : undefined,
			};
		}

		return {
			locations: paths.slice(0, pageSize),
			nextToken: `${pageSize}`,
		};
	}

	return {
		locations: paths,
	};
};
