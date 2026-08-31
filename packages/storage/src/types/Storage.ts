// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Storage instance options
 */

import { ICredentials } from '@aws-amplify/core';
import {
	StorageProvider,
	StorageProviderApi,
	AWSS3Provider,
	StorageProviderWithCopy,
	S3ProviderGetOuput,
	S3ProviderRemoveOutput,
	S3ProviderListOutput,
	S3ProviderCopyOutput,
	S3ProviderPutOutput,
	S3ProviderGetPropertiesOutput,
	StorageProviderWithGetProperties,
} from '../';

type Tail<T extends any[]> = ((...t: T) => void) extends (
	h: any,
	...r: infer R
) => void
	? R
	: never;

type Last<T extends any[]> = T[Exclude<keyof T, keyof Tail<T>>];

// Utility type to extract the last parameter type of a function
type LastParameter<F extends (...args: any) => any> = Last<Parameters<F>>;

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
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

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type StorageAccessLevel = 'public' | 'protected' | 'private';

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type CustomPrefix = {
	[key in StorageAccessLevel]?: string;
};

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type StorageCopyTarget = {
	key: string;
	level?: string;
	identityId?: string;
};

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type StorageCopySource = StorageCopyTarget;

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type StorageCopyDestination = Omit<StorageCopyTarget, 'identityId'>;

/**
 * If provider is AWSS3, provider doesn't have to be specified since it's the default, else it has to be passed into
 * config.
 */
type StorageOperationConfig<
	T extends
		| StorageProvider
		| StorageProviderWithCopy
		| StorageProviderWithGetProperties,
	U extends StorageProviderApi
> = ReturnType<T['getProviderName']> extends 'AWSS3'
	? LastParameter<AWSS3Provider[U]> // check if it has 'copy' function because 'copy' is optional
	: T extends StorageProviderWithGetProperties & StorageProviderWithCopy
	? LastParameter<T[U]> & {
			provider: ReturnType<T['getProviderName']>;
	  }
	: T extends StorageProviderWithCopy
	? LastParameter<T[Exclude<U, 'getProperties'>]> & {
			provider: ReturnType<T['getProviderName']>;
	  }
	: T extends StorageProviderWithGetProperties
	? LastParameter<T[Exclude<U, 'copy'>]> & {
			provider: ReturnType<T['getProviderName']>;
	  }
	: LastParameter<T[Exclude<U, 'copy' | 'getProperties'>]> & {
			provider: ReturnType<T['getProviderName']>;
	  };

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type StorageGetConfig<T extends Record<string, any>> =
	T extends StorageProvider
		? StorageOperationConfig<T, 'get'>
		: StorageOperationConfigMap<
				StorageOperationConfig<AWSS3Provider, 'get'>,
				T
		  >;

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type StorageGetPropertiesConfig<T extends Record<string, any>> =
	T extends StorageProviderWithGetProperties
		? StorageOperationConfig<T, 'getProperties'>
		: StorageOperationConfigMap<
				StorageOperationConfig<AWSS3Provider, 'getProperties'>,
				T
		  >;

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type StoragePutConfig<T extends Record<string, any>> =
	T extends StorageProvider
		? StorageOperationConfig<T, 'put'>
		: StorageOperationConfigMap<
				StorageOperationConfig<AWSS3Provider, 'put'>,
				T
		  >;

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type StorageRemoveConfig<T extends Record<string, any>> =
	T extends StorageProvider
		? StorageOperationConfig<T, 'remove'>
		: StorageOperationConfigMap<
				StorageOperationConfig<AWSS3Provider, 'remove'>,
				T
		  >;

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type StorageListConfig<T extends Record<string, any>> =
	T extends StorageProvider
		? StorageOperationConfig<T, 'list'>
		: StorageOperationConfigMap<
				StorageOperationConfig<AWSS3Provider, 'list'>,
				T
		  >;

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type StorageCopyConfig<T extends Record<string, any>> =
	T extends StorageProviderWithCopy
		? StorageOperationConfig<T, 'copy'>
		: StorageOperationConfigMap<
				StorageOperationConfig<AWSS3Provider, 'copy'>,
				T
		  >;

/**
 * Utility type for checking if the generic type is a provider or a Record that has the key 'provider'.
 * If it's a provider, check if it's the S3 Provider, use the default type else use the generic's 'get' method
 * return type.
 * If it's a Record, check if provider is 'AWSS3', use the default type else use any.
 */
type PickProviderOutput<
	DefaultOutput,
	T,
	api extends StorageProviderApi
> = T extends StorageProvider
	? T['getProviderName'] extends 'AWSS3'
		? DefaultOutput
		: T extends StorageProviderWithCopy & StorageProviderWithGetProperties
		? ReturnType<T[api]>
		: T extends StorageProviderWithCopy
		? ReturnType<T[Exclude<api, 'getProperties'>]>
		: T extends StorageProviderWithGetProperties
		? ReturnType<T[Exclude<api, 'copy'>]>
		: ReturnType<T[Exclude<api, 'copy' | 'getProperties'>]>
	: T extends { provider: string }
	? T extends { provider: 'AWSS3' }
		? DefaultOutput
		: Promise<any>
	: DefaultOutput;

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type StorageGetOutput<T extends StorageProvider | Record<string, any>> =
	PickProviderOutput<Promise<S3ProviderGetOuput<T>>, T, 'get'>;

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type StoragePutOutput<T> = PickProviderOutput<
	S3ProviderPutOutput<T>,
	T,
	'put'
>;

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type StorageRemoveOutput<T> = PickProviderOutput<
	Promise<S3ProviderRemoveOutput>,
	T,
	'remove'
>;

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type StorageListOutput<T> = PickProviderOutput<
	Promise<S3ProviderListOutput>,
	T,
	'list'
>;

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type StorageCopyOutput<T> = PickProviderOutput<
	Promise<S3ProviderCopyOutput>,
	T,
	'copy'
>;

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type StorageGetPropertiesOutput<T> = PickProviderOutput<
	Promise<S3ProviderGetPropertiesOutput>,
	T,
	'getProperties'
>;

/**
 * Utility type to allow custom provider to use any config keys, if provider is set to AWSS3 then it should use
 * AWSS3Provider's config.
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type StorageOperationConfigMap<
	Default,
	T extends Record<string, any>
> = T extends { provider: string }
	? T extends { provider: 'AWSS3' }
		? Default
		: T & { provider: string }
	: Default;
