import {
	S3Client,
	GetObjectCommandInput,
	GetObjectCommand,
	GetObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { S3RequestPresigner } from '@aws-sdk/s3-request-presigner';
import { getSignedParams } from '@aws-amplify/core';
import { getPrefix } from '../../common/S3ClientUtils';
import { S3ProviderGetConfig } from '../../types';
import { getStorageConfig } from '../utils';
import { generatePresignedUrl } from '../client';

const DEFAULT_PRESIGN_EXPIRATION = 900;

export const get = async (
	key: string,
	awsCreds: any,
	config?: S3ProviderGetConfig,
	sdkClientCreator?: (key: string, options: any) => Promise<S3Client> // S3 client escape hatch
): Promise<string | GetObjectCommandOutput | Response> => {
	const s3GlobalConfig = getStorageConfig();
	const options = Object.assign({}, s3GlobalConfig, config);
	const {
		bucket,
		download,
		cacheControl,
		contentDisposition,
		contentEncoding,
		contentLanguage,
		contentType,
		expires,
		track,
		SSECustomerAlgorithm,
		SSECustomerKey,
		SSECustomerKeyMD5,
		progressCallback,
	} = options;
	const prefix = getPrefix({ ...options, credentials: awsCreds }); // TODO Standardize prefix generation across APIs
	const final_key = prefix + key;
	const path = `https://${options.bucket}.s3.${options.region}.amazonaws.com/${final_key}`;

	// Build request & S3 command
	const params: GetObjectCommandInput = {
		Bucket: bucket,
		Key: final_key,
		ResponseCacheControl: cacheControl,
		ResponseContentDisposition: contentDisposition,
		ResponseContentEncoding: contentEncoding,
		ResponseContentLanguage: contentLanguage,
		ResponseContentType: contentType,
		SSECustomerAlgorithm: SSECustomerAlgorithm,
		SSECustomerKey: SSECustomerKey,
		SSECustomerKeyMD5: SSECustomerKeyMD5,
	};

	// Initialize client
	const sdkClient = sdkClientCreator && (await sdkClientCreator(key, options));

	if (sdkClient) {
		// Check if we should download immediately
		if (download) {
			//const command = new GetObjectCommand(params);

			if (progressCallback) {
				console.error('Progress callback not currently supported');
			}

			//const response = await sdkClient.send(command);

			//return response as GetObjectCommandOutput;
		} else {
			// If not downloading, generate a pre-signed URL
			const s3ClientConfig = sdkClient.config;
			const signer = s3ClientConfig && new S3RequestPresigner(s3ClientConfig);
			/*const request = await createRequest(
				sdkClient,
				new GetObjectCommand(params)
			);
			const url = formatUrl(
				await signer.presign(request, {
					expiresIn: expires || DEFAULT_PRESIGN_EXPIRATION,
				})
			);

			return url;*/
		}
	} else {
		if (download) {
			let headers = {
				'X-Amz-Content-Sha256':
					'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
			};

			// Generate authorization headers
			// TODO Merge this with http client
			const signed_params = getSignedParams({
				region: options.region,
				params: {
					method: 'GET',
					data: null,
					url: path,
					headers,
				},
				credentials: {
					...awsCreds,
				},
				service: 's3',
			});
			headers = { ...headers, ...signed_params.headers };

			const response = await fetch(path, {
				method: 'GET',
				body: null,
				mode: 'cors',
				headers,
			});

			return response;
		} else {
			// Generate a pre-signed URL
			const presignedUrl = await generatePresignedUrl(
				path,
				options.region,
				awsCreds,
				'GET'
			);

			return presignedUrl;
		}
	}

	return '';
};
