// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CredentialsProvider, ListLocations } from '../types';

export interface CreateListLocationsHandlerInput {
	accountId: string;
	credentialsProvider: CredentialsProvider;
	region: string;
}

export const createListLocationsHandler = (
	// eslint-disable-next-line unused-imports/no-unused-vars
	input: CreateListLocationsHandlerInput,
): ListLocations => {
	// TODO(@AllanZhengYP)
	throw new Error('Not Implemented');
};
