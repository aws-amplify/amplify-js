import { Amplify, parseAWSExports } from '@aws-amplify/core';
import * as events from 'events';
import {
	createS3Client,
	MAX_OBJECT_SIZE,
	createPrefixMiddleware,
	prefixMiddlewareOptions,
} from '../../common/S3ClientUtils';

export const createSDKClient = async (
	key: string,
	options: any
): Promise<any> => {
	const emitter = new events.EventEmitter();

	// TODO Investigate sharing client between APIs & impact to tree-shaking
	const s3client = createS3Client(options, emitter); // TODO Swap out credential provider

	// Setup client middleware
	// TODO Standardize prefix generation between APIS
	s3client.middlewareStack.add(
		createPrefixMiddleware(options, key),
		prefixMiddlewareOptions
	);

	return s3client;
};

export const getStorageConfig = () => {
	const amplifyConfig = parseAWSExports(Amplify.getConfig()) as any;
	const s3GlobalConfig = amplifyConfig?.Storage.AWSS3;

	if (!s3GlobalConfig) {
		throw Error('S3 has not been configured.');
	}

	return s3GlobalConfig;
};

export const byteLength = (input: any) => {
	if (input === null || input === undefined) return 0;
	if (typeof input.byteLength === 'number') {
		return input.byteLength;
	} else if (typeof input.length === 'number') {
		return input.length;
	} else if (typeof input.size === 'number') {
		return input.size;
	} else {
		throw new Error('Cannot determine length of ' + input);
	}
};

export const isGenericObject = (body: any): body is Object => {
	if (body !== null && typeof body === 'object') {
		try {
			return !(byteLength(body) >= 0);
		} catch (error) {
			// If we cannot determine the length of the body, consider it
			// as a generic object and upload a stringified version of it
			return true;
		}
	}
	return false;
};

export const validateAndSanitizeBody = (body: any): any => {
	const sanitizedBody = isGenericObject(body) ? JSON.stringify(body) : body;

	if (byteLength(sanitizedBody) > MAX_OBJECT_SIZE) {
		throw new Error('File size bigger than S3 Object limit of 5TB.');
	}

	return sanitizedBody;
};
