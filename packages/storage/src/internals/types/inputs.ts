// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageCopyInputWithPath,
	StorageOperationInputWithPath,
	StorageOperationOptionsInput,
} from '../../types/inputs';
import { GetPropertiesWithPathInput } from '../../providers/s3';

import { CredentialsProvider, ListLocationsInput } from './credentials';
import { Permission, PrefixType, Privilege } from './common';

/**
 * @internal
 */
export interface ListCallerAccessGrantsInput extends ListLocationsInput {
	accountId: string;
	credentialsProvider: CredentialsProvider;
	region: string;
}

/**
 * @internal
 */
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

/**
 * @internal
 */
export type GetPropertiesInput = ExtendInputWithAdvancedOptions<
	GetPropertiesWithPathInput,
	{
		locationCredentialsProvider?: CredentialsProvider;
	}
>;

/**
 * Generic types that extend the public API input type with extended options. By default the
 * extended options are locationCredentialsProvider.
 *
 * @internal
 */
export type ExtendInputWithAdvancedOptions<InputType, ExtendedOptionsType> =
	InputType extends StorageOperationInputWithPath &
		StorageOperationOptionsInput<infer O>
		? {
				path: InputType['path'];
				options?: O & ExtendedOptionsType;
			}
		: InputType extends StorageCopyInputWithPath
			? {
					source: InputType['source'];
					destination: InputType['destination'];
					options?: ExtendedOptionsType;
				}
			: never;
