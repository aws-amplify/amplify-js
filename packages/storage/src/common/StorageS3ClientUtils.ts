import { getAmplifyUserAgent, ICredentials } from '@aws-amplify/core';
import { S3Client } from '@aws-sdk/client-s3';
import { CancelTokenSource } from 'axios';
import * as events from 'events';
import { AxiosHttpHandler } from '../providers/axios-http-handler';

const localTestingStorageEndpoint = 'http://localhost:20005';

export const createNewS3Client = (
	config: {
		credentials: ICredentials;
		region?: string;
		cancelTokenSource?: CancelTokenSource;
		dangerouslyConnectToHttpEndpointForTesting?: boolean;
	},
	emitter?: events.EventEmitter
): S3Client => {
	const {
		region,
		credentials,
		cancelTokenSource,
		dangerouslyConnectToHttpEndpointForTesting,
	} = config;
	const localTestingConfig = dangerouslyConnectToHttpEndpointForTesting
		? {
				endpoint: localTestingStorageEndpoint,
				tls: false,
				bucketEndpoint: false,
				forcePathStyle: true,
		  }
		: {};
	const s3client = new S3Client({
		region,
		credentials,
		customUserAgent: getAmplifyUserAgent(),
		...localTestingConfig,
		requestHandler: new AxiosHttpHandler({}, emitter, cancelTokenSource),
	});
	return s3client;
};
