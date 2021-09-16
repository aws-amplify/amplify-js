/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
/**
 * Storage instance options
 */

import { ICredentials } from '@aws-amplify/core';
import { StorageProvider, StorageProviderApi, AWSS3Provider, StorageProviderWithCopy } from '..';

type Tail<T extends any[]> = ((...t: T) => void) extends (h: any, ...r: infer R) => void ? R : never;

type Last<T extends any[]> = T[Exclude<keyof T, keyof Tail<T>>];

// Utility type to extract the last parameter type of a function
type LastParameter<F extends (...args: any) => any> = Last<Parameters<F>>;

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
 * If provider is AWSS3, provider doesn't have to be specified since it's the default, else it has to be passed into
 * config.
 */
type StorageOperationConfig<
	T extends StorageProvider | StorageProviderWithCopy,
	U extends StorageProviderApi
> = ReturnType<T['getProviderName']> extends 'AWSS3' // Config is always the last parameter of the function
	? LastParameter<AWSS3Provider[U]>
	: T extends StorageProviderWithCopy
	? LastParameter<T[U]> & { provider: ReturnType<T['getProviderName']> }
	: U extends 'copy'
	? never
	: LastParameter<T[U]> & { provider: ReturnType<T['getProviderName']> };

export type StorageGetConfig<T> = T extends StorageProvider
	? StorageOperationConfig<T, 'get'>
	: StorageOperationConfigMap<StorageOperationConfig<AWSS3Provider, 'get'>, T>;

export type StoragePutConfig<T> = T extends StorageProvider
	? StorageOperationConfig<T, 'put'>
	: StorageOperationConfigMap<StorageOperationConfig<AWSS3Provider, 'put'>, T>;

export type StorageRemoveConfig<T> = T extends StorageProvider
	? StorageOperationConfig<T, 'remove'>
	: StorageOperationConfigMap<StorageOperationConfig<AWSS3Provider, 'remove'>, T>;

export type StorageListConfig<T> = T extends StorageProvider
	? StorageOperationConfig<T, 'list'>
	: StorageOperationConfigMap<StorageOperationConfig<AWSS3Provider, 'list'>, T>;

export type StorageCopyConfig<T> = T extends StorageProviderWithCopy
	? StorageOperationConfig<T, 'copy'>
	: StorageOperationConfigMap<StorageOperationConfig<AWSS3Provider, 'copy'>, T>;

/**
 * Utility type to allow custom provider to use any config keys, if provider is set to AWSS3 then it should use
 * AWSS3Provider's config.
 */
export type StorageOperationConfigMap<Default, T extends Record<string, any>> = T extends { provider: string }
	? T extends { provider: 'AWSS3' }
		? Default
		: T & { provider: string }
	: Default;
