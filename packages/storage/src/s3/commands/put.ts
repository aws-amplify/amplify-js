import { PutObjectCommand } from '@aws-sdk/client-s3';
import { DEFAULT_PART_SIZE } from '../../common/S3ClientUtils';
import { S3ProviderPutConfig } from '../../types';
import {
	byteLength,
	validateAndSanitizeBody,
	getStorageConfig,
} from '../utils';
// TODO Why is this import broken?
//import { fetchCredentials } from '@aws-amplify/auth/cognito';
import { generatePresignedUrl } from '../client';

export const put = async (
	key: string,
	object: any,
	awsCreds: any,
	config?: S3ProviderPutConfig,
	sdkClientCreator?: (key: string, options: any) => Promise<any> // S3 client escape hatch
): Promise<any> => {
	const s3GlobalConfig = getStorageConfig();

	// Build request options & S3 command
	const options = Object.assign({}, s3GlobalConfig, config);
	const {
		bucket,
		track,
		progressCallback,
		level,
		resumable,
		contentType,
		contentDisposition,
		contentEncoding,
		cacheControl,
		expires,
		metadata,
		tagging,
		acl,
		serverSideEncryption,
		SSECustomerAlgorithm,
		SSECustomerKey,
		SSECustomerKeyMD5,
		SSEKMSKeyId,
		region,
	} = options;

	const putParams = {
		Bucket: bucket,
		Key: key,
		Body: object,
		ContentType: contentType ? contentType : 'binary/octet-stream',
		CacheControl: cacheControl,
		ContentDisposition: contentDisposition,
		ContentEncoding: contentEncoding,
		Expires: expires,
		Metadata: metadata,
		Tagging: tagging,
		ServerSideEncryption: serverSideEncryption,
		SSECustomerAlgorithm: SSECustomerAlgorithm,
		SSECustomerKey: SSECustomerKey,
		SSECustomerKeyMD5: SSECustomerKeyMD5,
		SSEKMSKeyId: SSEKMSKeyId,
	};

	// Construct request
	const sanitizedBody = validateAndSanitizeBody(putParams.Body);
	const fileSize = byteLength(sanitizedBody);
	if (fileSize <= DEFAULT_PART_SIZE) {
		putParams.Body = sanitizedBody;

		// TODO Handle resumable uploads
		// TODO Add progress callback
	} else {
		// TODO Hand multi-part uploads. Should this be broken into it's own API for tree-shaking? Use existing class or refactor?
	}

	// Check if customer wants to use SDK escape hatch
	if (sdkClientCreator) {
		//const putObjectCommand = new PutObjectCommand(putParams);
		//const s3Client = await sdkClientCreator(key, options);
		//return s3Client.send(putObjectCommand);
	} else {
		const path = `https://${bucket}.s3.${region}.amazonaws.com/public/${key}`;
		const presignedUrl = await generatePresignedUrl(
			path,
			region,
			awsCreds,
			'PUT'
		);

		const results = await fetch(presignedUrl, {
			method: 'PUT',
			body: sanitizedBody,
			headers: {
				'Content-Length': fileSize,
			},
		});

		console.log('+ S3 put', results);

		return results;
	}
};
