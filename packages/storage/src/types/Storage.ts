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
import {
	S3ProviderGetConfig,
	S3ProviderGetOuput,
	S3ProviderPutConfig,
	S3ProviderRemoveConfig,
	S3ProviderListConfig,
	S3ProviderCopyConfig,
	S3ProviderPutOutput,
	S3ProviderRemoveOutput,
	S3ProviderListOutput,
	S3ProviderCopyOutput,
} from './AWSS3Provider';

export interface StorageOptions {
	credentials?: ICredentials;
	region?: string;
	level?: StorageLevel;
	bucket?: string;
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

export interface StorageMobileHubConfig {
	Storage: {
		AWSS3: {
			bucket: string;
			region: string;
			dangerouslyConnectToHttpEndpointForTesting?: boolean;
		};
	};
}

export type StorageLevel = 'public' | 'protected' | 'private';

export type CustomPrefix = {
	[key in StorageLevel]?: string;
};

export type StorageCopyTarget = {
	key: string;
	level?: string;
	identityId?: string;
};

export type StorageCopySource = StorageCopyTarget;

export type StorageCopyDestination = Omit<StorageCopyTarget, 'identityId'>;

/**
 * If a provider is not the default provider, allow the generic type, else use the default provider's config
 */
export type StorageOperationConfig<DefaultConfig, T> = T extends {
	provider: string;
}
	? T extends { provider: 'AWSS3' }
		? DefaultConfig
		: T & { provider: string }
	: DefaultConfig;

/**
 * If a provider is not the default provider, allow the generic type, else use the default provider's output
 */
export type StorageOperationOutput<DefaultOutput, T, U> = T extends {
	provider: string;
}
	? T extends { provider: 'AWSS3' }
		? DefaultOutput
		: U
	: DefaultOutput;

export type StorageGetConfig<T> = StorageOperationConfig<
	S3ProviderGetConfig,
	T
>;

export type StorageGetOutput<T, U> = StorageOperationOutput<
	S3ProviderGetOuput<T>,
	T,
	U
>;

export type StoragePutConfig<T> = StorageOperationConfig<
	S3ProviderPutConfig,
	T
>;

export type StoragePutOutput<T, U> = StorageOperationOutput<
	S3ProviderPutOutput,
	T,
	U
>;

export type StorageRemoveConfig<T> = StorageOperationConfig<
	S3ProviderRemoveConfig,
	T
>;

export type StorageRemoveOutput<T, U> = StorageOperationOutput<
	S3ProviderRemoveOutput,
	T,
	U
>;

export type StorageListConfig<T> = StorageOperationConfig<
	S3ProviderListConfig,
	T
>;

export type StorageListOutput<T, U> = StorageOperationOutput<
	S3ProviderListOutput,
	T,
	U
>;

export type StorageCopyConfig<T> = StorageOperationConfig<
	S3ProviderCopyConfig,
	T
>;

export type StorageCopyOutput<T, U> = StorageOperationOutput<
	S3ProviderCopyOutput,
	T,
	U
>;
