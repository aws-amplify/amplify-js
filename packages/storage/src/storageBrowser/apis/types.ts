// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AccessGrant,
	CredentialsProvider,
	ListLocationsInput,
	ListLocationsOutput,
	LocationCredentials,
	Permission,
	PrefixType,
	Privilege,
} from '../types';

export interface ListCallerAccessGrantsInput extends ListLocationsInput {
	accountId: string;
	credentialsProvider: CredentialsProvider;
	region: string;
}

export type ListCallerAccessGrantsOutput = ListLocationsOutput<AccessGrant>;

export interface GetDataAccessInput {
	accountId: string;
	credentialsProvider: CredentialsProvider;
	durationSeconds?: number;
	permission: Permission;
	prefixType?: PrefixType;
	privilege?: Privilege;
	region: string;
	scope: string;
}

export type GetDataAccessOutput = LocationCredentials;
