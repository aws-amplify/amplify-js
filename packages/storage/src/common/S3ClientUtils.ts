import {
	Credentials,
	ICredentials,
	Logger,
	getAmplifyUserAgent,
} from '@aws-amplify/core';
import { StorageAccessLevel, CustomPrefix } from '../types';
import {
	InitializeMiddleware,
	InitializeHandlerOptions,
	FinalizeRequestHandlerOptions,
	FinalizeRequestMiddleware,
	HandlerExecutionContext,
} from '@aws-sdk/types';
import { S3ClientConfig, S3Client } from '@aws-sdk/client-s3';
import { CancelTokenSource } from 'axios';
import * as events from 'events';
import { AxiosHttpHandler } from '../providers/axios-http-handler';
import {
	localTestingStorageEndpoint,
	SET_CONTENT_LENGTH_HEADER,
} from './StorageConstants';

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

export const createPrefixMiddleware = (
	opt: Record<string, any>,
	key: string
): InitializeMiddleware<any, any> => (next, _context) => async args => {
	const credentials = await Credentials.get();
	const cred = Credentials.shear(credentials);
	const prefix = getPrefix({ ...opt, credentials: cred });
	const clonedInput = Object.assign({}, args.input);
	if (Object.prototype.hasOwnProperty.call(args.input, 'Key')) {
		clonedInput.Key = prefix + key;
		args.input = clonedInput;
	} else if (Object.prototype.hasOwnProperty.call(args.input, 'Prefix')) {
		clonedInput.Prefix = prefix + key;
		args.input = clonedInput;
	}
	const result = next(args);
	return result;
};

const isTimeSkewedError = (err: any): boolean =>
	err.ServerTime &&
	typeof err.Code === 'string' &&
	err.Code === 'RequestTimeTooSkewed';

// we want to take the S3Client config in parameter so we can modify it's systemClockOffset
export const autoAdjustClockskewMiddleware = (
	config: S3ClientConfig
): FinalizeRequestMiddleware<any, any> => (
	next,
	_context: HandlerExecutionContext
) => async args => {
	try {
		return await next(args);
	} catch (err) {
		if (isTimeSkewedError(err)) {
			const serverDate = new Date(err.ServerTime);
			config.systemClockOffset = serverDate.getTime() - Date.now();
		}
		throw err;
	}
};

export const autoAdjustClockskewMiddlewareOptions: FinalizeRequestHandlerOptions = {
	step: 'finalizeRequest',
	name: 'autoAdjustClockskewMiddleware',
};

export const prefixMiddlewareOptions: InitializeHandlerOptions = {
	step: 'initialize',
	name: 'addPrefixMiddleware',
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

export const createS3Client = (
	config: {
		region?: string;
		cancelTokenSource?: CancelTokenSource;
		dangerouslyConnectToHttpEndpointForTesting?: boolean;
		useAccelerateEndpoint?: boolean;
	},
	emitter?: events.EventEmitter
): S3Client => {
	const {
		region,
		cancelTokenSource,
		dangerouslyConnectToHttpEndpointForTesting,
		useAccelerateEndpoint,
	} = config;
	let localTestingConfig = {};

	if (dangerouslyConnectToHttpEndpointForTesting) {
		localTestingConfig = {
			endpoint: localTestingStorageEndpoint,
			tls: false,
			bucketEndpoint: false,
			forcePathStyle: true,
		};
	}

	const s3client = new S3Client({
		region,
		// Using provider instead of a static credentials, so that if an upload task was in progress, but credentials gets
		// changed or invalidated (e.g user signed out), the subsequent requests will fail.
		credentials: credentialsProvider,
		customUserAgent: getAmplifyUserAgent(),
		...localTestingConfig,
		requestHandler: new AxiosHttpHandler({}, emitter, cancelTokenSource),
		useAccelerateEndpoint,
	});
	s3client.middlewareStack.remove(SET_CONTENT_LENGTH_HEADER);
	return s3client;
};
