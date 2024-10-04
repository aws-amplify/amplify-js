// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageCopyInputWithPath,
	StorageOperationInputWithPath,
	StorageOperationOptionsInput,
} from '../../types/inputs';
import {
	CopyWithPathInput,
	DownloadDataWithPathInput,
	GetPropertiesWithPathInput,
	RemoveWithPathInput,
} from '../../providers/s3';

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
export type RemoveInput = ExtendInputWithAdvancedOptions<
	RemoveWithPathInput,
	{
		locationCredentialsProvider?: CredentialsProvider;
	}
>;

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
 * @internal
 */
export type CopyInput = ExtendCopyInputWithAdvancedOptions<
	CopyWithPathInput,
	{
		locationCredentialsProvider?: CredentialsProvider;
	}
>;

/**
 * @internal
 */
export type DownloadDataInput = ExtendInputWithAdvancedOptions<
	DownloadDataWithPathInput,
	{
		locationCredentialsProvider?: CredentialsProvider;
	}
>;

/**
 * Generic types that extend the public non-copy API input types with extended
 * options. This is a temporary solution to support advanced options from internal APIs.
 */
type ExtendInputWithAdvancedOptions<InputType, ExtendedOptionsType> =
	InputType extends StorageOperationInputWithPath &
		StorageOperationOptionsInput<infer PublicInputOptionsType>
		? {
				path: InputType['path'];
				options?: PublicInputOptionsType & ExtendedOptionsType;
			}
		: never;

/**
 * Generic types that extend the public copy API input type with extended options.
 * This is a temporary solution to support advanced options from internal APIs.
 */
type ExtendCopyInputWithAdvancedOptions<InputType, ExtendedOptionsType> =
	InputType extends StorageCopyInputWithPath
		? {
				source: InputType['source'];
				destination: InputType['destination'];
				options?: ExtendedOptionsType;
			}
		: never;
