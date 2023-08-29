// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Storage instance options
 */

import { ICredentials } from '@aws-amplify/core';
import {
	StorageProviderApi,
	StorageProviderApiOptionsIndexMap,
} from '../';

type Tail<T extends any[]> = ((...t: T) => void) extends (
	h: any,
	...r: infer R
) => void
	? R
	: never;

type Last<T extends any[]> = T[Exclude<keyof T, keyof Tail<T>>];

// Utility type to extract the config parameter type of a function
// Uses position of params per API to determine which parameter to target
type ConfigParameter<
	F extends (...args: any) => any,
	U extends StorageProviderApi
> = Parameters<F>[StorageProviderApiOptionsIndexMap[U]];

export interface StorageOptions {
	credentials?: ICredentials;
	region?: string;
	level?: StorageAccessLevel;
	bucket?: string;
	provider?: string;
	/**
	 * Custom mapping of your prefixes.
	 * For example, customPrefix: { public: 'myPublicPrefix' } will make public level operations access 'myPublicPrefix/'
	 * instead of the default 'public/'.
	 */
	customPrefix?: CustomPrefix;
	/**
	 * if set to true, automatically sends Storage Events to Amazon Pinpoint
	 **/
	track?: boolean;
	dangerouslyConnectToHttpEndpointForTesting?: boolean;
}

export type StorageAccessLevel = 'public' | 'protected' | 'private';

export type CustomPrefix = {
	[key in StorageAccessLevel]?: string;
};

export type StorageCopyTarget = {
	key: string;
	level?: string;
	identityId?: string;
};

export type StorageCopySource = StorageCopyTarget;

export type StorageCopyDestination = Omit<StorageCopyTarget, 'identityId'>;

/**
 * Utility type to allow custom provider to use any config keys, if provider is set to AWSS3 then it should use
 * AWSS3Provider's config.
 */
export type StorageOperationConfigMap<
	Default,
	T extends Record<string, any>
> = T extends { provider: string }
	? T extends { provider: 'AWSS3' }
		? Default
		: T & { provider: string }
	: Default;
