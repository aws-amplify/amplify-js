// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	Category,
	Credentials,
	ICredentials,
	Logger,
	StorageAction,
	getAmplifyUserAgent,
} from '@aws-amplify/core';
import type { Credentials as AwsCredentials } from '@aws-sdk/types';
import type { EventEmitter } from 'events';

import { StorageAccessLevel, CustomPrefix } from '../types';
import { localTestingStorageEndpoint } from './StorageConstants';

const logger = new Logger('S3ClientUtils');
// placeholder credentials in order to satisfy type requirement, always results in 403 when used
const INVALID_CRED = { accessKeyId: '', secretAccessKey: '' } as ICredentials;

export const getPrefix = (config: {
	credentials: ICredentials;
	level?: StorageAccessLevel;
	customPrefix?: CustomPrefix;
	identityId?: string;
}): string => {
	const { credentials, level, customPrefix, identityId } = config;

	const resolvedCustomPrefix = customPrefix || {};
	const resolvedIdentityId = identityId || credentials.identityId;
	const privatePath =
		(resolvedCustomPrefix.private !== undefined
			? resolvedCustomPrefix.private
			: 'private/') +
		resolvedIdentityId +
		'/';
	const protectedPath =
		(resolvedCustomPrefix.protected !== undefined
			? resolvedCustomPrefix.protected
			: 'protected/') +
		resolvedIdentityId +
		'/';
	const publicPath =
		resolvedCustomPrefix.public !== undefined
			? resolvedCustomPrefix.public
			: 'public/';

	switch (level) {
		case 'private':
			return privatePath;
		case 'protected':
			return protectedPath;
		default:
			return publicPath;
	}
};

export const credentialsProvider = async () => {
	try {
		const credentials = await Credentials.get();
		if (!credentials) return INVALID_CRED;
		const cred = Credentials.shear(credentials);
		logger.debug('credentials provider get credentials', cred);
		return cred;
	} catch (error) {
		logger.warn('credentials provider error', error);
		return INVALID_CRED;
	}
};

interface S3InputConfig {
	credentials?: AwsCredentials;
	region?: string;
	useAccelerateEndpoint?: boolean;
	abortSignal?: AbortSignal;
	emitter?: EventEmitter;
	storageAction: StorageAction;
	dangerouslyConnectToHttpEndpointForTesting?: boolean;
}

export interface S3ResolvedConfig
	extends Omit<S3InputConfig, 'region' | 'credentials'> {
	region: string;
	userAgentValue?: string;
	credentials: () => Promise<AwsCredentials>;
	customEndpoint?: string;
	forcePathStyle?: boolean;
}

/**
 * A function that persists the s3 configs, so we don't need to
 * assign each config parameter for every s3 API call.
 *
 * @inernal
 */
export const loadS3Config = (config: S3InputConfig): S3ResolvedConfig => {
	if (!config.region) {
		// Same error thrown by aws-sdk
		throw new Error('Region is missing.');
	}
	return {
		...config,
		region: config.region,
		credentials: config.credentials
			? () => Promise.resolve(config.credentials!)
			: credentialsProvider,
		userAgentValue: getAmplifyUserAgent({
			category: Category.Storage,
			action: config.storageAction,
		}),
		...(config.dangerouslyConnectToHttpEndpointForTesting
			? {
					customEndpoint: localTestingStorageEndpoint,
					forcePathStyle: true,
			  }
			: {}),
	};
};

const MiB = 1024 * 1024;
const GiB = 1024 * MiB;
const TiB = 1024 * GiB;

export const DEFAULT_PART_SIZE = 5 * MiB;
export const MAX_OBJECT_SIZE = 5 * TiB;
export const MAX_PARTS_COUNT = 10000;
export const DEFAULT_QUEUE_SIZE = 4;

export const calculatePartSize = (totalSize: number): number => {
	let partSize = DEFAULT_PART_SIZE;
	let partsCount = Math.ceil(totalSize / partSize);
	while (partsCount > MAX_PARTS_COUNT) {
		partSize *= 2;
		partsCount = Math.ceil(totalSize / partSize);
	}
	return partSize;
};
