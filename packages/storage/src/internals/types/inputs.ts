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
	GetUrlWithPathInput,
	RemoveWithPathInput,
} from '../../providers/s3';
import {
	ListAllWithPathInput,
	ListPaginateWithPathInput,
} from '../../providers/s3/types/inputs';

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

export interface AdvancedOptions {
	locationCredentialsProvider?: CredentialsProvider;
	baseEndpoint?: string;
}

/**
 * @internal
 */
export type ListInputWithPath = ExtendInputWithAdvancedOptions<
	ListAllWithPathInput | ListPaginateWithPathInput,
	AdvancedOptions
>;

/**
 * @internal
 */
export type RemoveInput = ExtendInputWithAdvancedOptions<
	RemoveWithPathInput,
	AdvancedOptions
>;

/**
 * @internal
 */
export type GetPropertiesInput = ExtendInputWithAdvancedOptions<
	GetPropertiesWithPathInput,
	AdvancedOptions
>;

/**
 * @internal
 */
export type GetUrlInput = ExtendInputWithAdvancedOptions<
	GetUrlWithPathInput,
	AdvancedOptions
>;

/**
 * @internal
 */
export type CopyInput = ExtendCopyInputWithAdvancedOptions<
	CopyWithPathInput,
	AdvancedOptions
>;

/**
 * @internal
 */
export type DownloadDataInput = ExtendInputWithAdvancedOptions<
	DownloadDataWithPathInput,
	AdvancedOptions
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
