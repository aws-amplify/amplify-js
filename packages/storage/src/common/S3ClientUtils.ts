import { Credentials, ICredentials, Logger } from '@aws-amplify/core';
import type { EventEmitter } from 'events';

import { StorageAccessLevel, CustomPrefix } from '../types';

const logger = new Logger('S3ClientUtils');
// placeholder credentials in order to satisfy type requirement, always results in 403 when used
const INVALID_CRED = { accessKeyId: '', secretAccessKey: '' };

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

export interface S3Config {
	region: string;
	credentials: () => Promise<{
		accessKeyId: string;
		secretAccessKey: string;
		sessionToken?: string;
	}>;
	useAccelerateEndpoint?: boolean;
	abortSignal?: AbortSignal;
	emitter?: EventEmitter;
}

/**
 * A function that persistent the s3 configs, so we don't need to
 * assigning each config parameter for every s3 API call.
 *
 * @inernal
 */
export const loadS3Config = (
	config: Omit<S3Config, 'credentials'>
): S3Config => ({
	...config,
	credentials: credentialsProvider,
});

const MB = 1024 * 1024;
const GB = 1024 * MB;
const TB = 1024 * GB;

export const DEFAULT_PART_SIZE = 5 * MB;
export const MAX_OBJECT_SIZE = 5 * TB;
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
