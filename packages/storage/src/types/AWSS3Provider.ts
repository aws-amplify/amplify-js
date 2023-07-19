// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ICredentials } from '@aws-amplify/core';
import {
	GetObjectInput,
	GetObjectOutput,
	PutObjectInput,
	CopyObjectInput,
	DeleteObjectOutput,
	HeadObjectInput,
	_Object,
} from '../AwsClients/S3';
import { StorageOptions, StorageAccessLevel } from './Storage';
import {
	UploadTaskCompleteEvent,
	UploadTaskProgressEvent,
} from '../providers/AWSS3UploadTask';
import { UploadTask } from './Provider';

type ListObjectsCommandOutputContent = _Object;

export interface FileMetadata {
	bucket: string;
	fileName: string;
	key: string;
	// Unix timestamp in ms
	lastTouched: number;
	uploadId: string;
}

export type CommonStorageOptions = Omit<
	StorageOptions,
	| 'credentials'
	| 'region'
	| 'bucket'
	| 'dangerouslyConnectToHttpEndpointForTesting'
>;

export type S3ProviderGetConfig = CommonStorageOptions & {
	download?: boolean;
	track?: boolean;
	expires?: number;
	provider?: 'AWSS3';
	identityId?: string;
	progressCallback?: (progress: any) => any;
	cacheControl?: GetObjectInput['ResponseCacheControl'];
	contentDisposition?: GetObjectInput['ResponseContentDisposition'];
	contentEncoding?: GetObjectInput['ResponseContentEncoding'];
	contentLanguage?: GetObjectInput['ResponseContentLanguage'];
	contentType?: GetObjectInput['ResponseContentType'];
	SSECustomerAlgorithm?: GetObjectInput['SSECustomerAlgorithm'];
	SSECustomerKey?: GetObjectInput['SSECustomerKey'];
	// TODO(AllanZhengYP): remove in V6.
	SSECustomerKeyMD5?: GetObjectInput['SSECustomerKeyMD5'];
	validateObjectExistence?: boolean;
};

export type S3ProviderGetPropertiesConfig = CommonStorageOptions & {
	SSECustomerAlgorithm?: HeadObjectInput['SSECustomerAlgorithm'];
	SSECustomerKey?: HeadObjectInput['SSECustomerKey'];
	// TODO(AllanZhengYP): remove in V6.
	SSECustomerKeyMD5?: HeadObjectInput['SSECustomerKeyMD5'];
};

export type S3ProviderGetOuput<T> = T extends { download: true }
	? GetObjectOutput
	: string;

type _S3ProviderPutConfig = {
	progressCallback?: (progress: any) => any;
	provider?: 'AWSS3';
	track?: boolean;
	serverSideEncryption?: PutObjectInput['ServerSideEncryption'];
	SSECustomerAlgorithm?: PutObjectInput['SSECustomerAlgorithm'];
	SSECustomerKey?: PutObjectInput['SSECustomerKey'];
	// TODO(AllanZhengYP): remove in V6.
	SSECustomerKeyMD5?: PutObjectInput['SSECustomerKeyMD5'];
	SSEKMSKeyId?: PutObjectInput['SSEKMSKeyId'];
	acl?: PutObjectInput['ACL'];
	bucket?: PutObjectInput['Bucket'];
	cacheControl?: PutObjectInput['CacheControl'];
	contentDisposition?: PutObjectInput['ContentDisposition'];
	contentEncoding?: PutObjectInput['ContentEncoding'];
	contentType?: PutObjectInput['ContentType'];
	expires?: PutObjectInput['Expires'];
	metadata?: PutObjectInput['Metadata'];
	tagging?: PutObjectInput['Tagging'];
	useAccelerateEndpoint?: boolean;
	resumable?: boolean;
};

export type ResumableUploadConfig = {
	resumable: true;
	progressCallback?: (progress: UploadTaskProgressEvent) => any;
	completeCallback?: (event: UploadTaskCompleteEvent) => any;
	errorCallback?: (err: any) => any;
};

/**
 * Configuration options for the S3 put function.
 *
 * @remarks
 * The acl parameter may now only be used for S3 buckets with specific Object Owner settings.
 * Usage of this parameter is not considered a recommended practice:
 *  {@link https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html}
 *
 */
export type S3ProviderPutConfig = CommonStorageOptions &
	(
		| _S3ProviderPutConfig
		// discriminated union so users won't be able to add resumable specific callbacks without the resumable flag
		| (_S3ProviderPutConfig & ResumableUploadConfig)
	);

export type S3ProviderRemoveConfig = CommonStorageOptions & {
	bucket?: string;
	provider?: 'AWSS3';
};

export type S3ProviderListOutput = {
	results: S3ProviderListOutputItem[];
	nextToken?: string;
	hasNextToken: boolean;
};

export type S3ProviderRemoveOutput = DeleteObjectOutput;

export type S3ProviderListConfig = CommonStorageOptions & {
	bucket?: string;
	pageSize?: number | 'ALL';
	provider?: 'AWSS3';
	identityId?: string;
	nextToken?: string;
};

export type S3ClientOptions = StorageOptions & {
	credentials: ICredentials;
} & S3ProviderListConfig;

export interface S3ProviderListOutputItem {
	key: ListObjectsCommandOutputContent['Key'];
	eTag: ListObjectsCommandOutputContent['ETag'];
	lastModified: ListObjectsCommandOutputContent['LastModified'];
	size: ListObjectsCommandOutputContent['Size'];
}

export interface S3CopyTarget {
	key: string;
	level?: StorageAccessLevel;
	identityId?: string;
}

export type S3CopySource = S3CopyTarget;

export type S3CopyDestination = Omit<S3CopyTarget, 'identityId'>;

/**
 * Configuration options for the S3 copy function.
 *
 * @remarks
 * The acl parameter may now only be used for S3 buckets with specific Object Owner settings.
 * Usage of this parameter is not considered a recommended practice:
 *  {@link https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html}
 *
 */
export type S3ProviderCopyConfig = Omit<CommonStorageOptions, 'level'> & {
	provider?: 'AWSS3';
	bucket?: CopyObjectInput['Bucket'];
	cacheControl?: CopyObjectInput['CacheControl'];
	contentDisposition?: CopyObjectInput['ContentDisposition'];
	contentLanguage?: CopyObjectInput['ContentLanguage'];
	contentType?: CopyObjectInput['ContentType'];
	expires?: CopyObjectInput['Expires'];
	tagging?: CopyObjectInput['Tagging'];
	acl?: CopyObjectInput['ACL'];
	metadata?: CopyObjectInput['Metadata'];
	serverSideEncryption?: CopyObjectInput['ServerSideEncryption'];
	SSECustomerAlgorithm?: CopyObjectInput['SSECustomerAlgorithm'];
	SSECustomerKey?: CopyObjectInput['SSECustomerKey'];
	// TODO(AllanZhengYP): remove in V6.
	SSECustomerKeyMD5?: CopyObjectInput['SSECustomerKeyMD5'];
	SSEKMSKeyId?: CopyObjectInput['SSEKMSKeyId'];
};

export type S3ProviderCopyOutput = {
	key: string;
};

export type S3ProviderGetPropertiesOutput = {
	contentType: string;
	contentLength: number;
	eTag: string;
	lastModified: Date;
	metadata: Record<string, string>;
};

export type PutResult = {
	key: string;
};

export type S3ProviderPutOutput<T> = T extends { resumable: true }
	? UploadTask
	: Promise<PutResult>;
