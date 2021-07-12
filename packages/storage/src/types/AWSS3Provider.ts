import {
	GetObjectRequest,
	GetObjectCommandOutput,
	PutObjectRequest,
	CopyObjectRequest,
	_Object,
} from '@aws-sdk/client-s3';
import { StorageOptions } from './Storage';

/** Get API options, specific to Amplify Storage */
export interface StorageGetOptions {
	download?: boolean;
	track?: boolean;
	expires?: number;
	provider?: string;
	progressCallback?: (progress: any) => any;
}

/** Get API options allowed to be passed to the underlying S3Client */
export interface S3ClientGetOptions {
	bucket?: GetObjectRequest['Bucket'];
	cacheControl?: GetObjectRequest['ResponseCacheControl'];
	contentDisposition?: GetObjectRequest['ResponseContentDisposition'];
	contentEncoding?: GetObjectRequest['ResponseContentEncoding'];
	contentLanguage?: GetObjectRequest['ResponseContentLanguage'];
	contentType?: GetObjectRequest['ResponseContentType'];
	SSECustomerAlgorithm?: GetObjectRequest['SSECustomerAlgorithm'];
	SSECustomerKey?: GetObjectRequest['SSECustomerKey'];
	SSECustomerKeyMD5?: GetObjectRequest['SSECustomerKeyMD5'];
}

export type S3ProviderGetOuput<T> = T extends { download: true }
	? GetObjectCommandOutput
	: string;

export type S3ProviderGetOptions = StorageGetOptions &
	S3ClientGetOptions &
	StorageOptions;

/** Put API options, specific to Amplify Storage */
export interface StoragePutOptions {
	progressCallback?: (progress: any) => any;
	track?: boolean;
}

/** Put API options allowed to be passed to the underlying S3Client */
export interface S3ClientPutOptions {
	serverSideEncryption?: PutObjectRequest['ServerSideEncryption'];
	SSECustomerAlgorithm?: PutObjectRequest['SSECustomerAlgorithm'];
	SSECustomerKey?: PutObjectRequest['SSECustomerKey'];
	SSECustomerKeyMD5?: PutObjectRequest['SSECustomerKeyMD5'];
	SSEKMSKeyId?: PutObjectRequest['SSEKMSKeyId'];
	acl?: PutObjectRequest['ACL'];
	bucket?: PutObjectRequest['Bucket'];
	cacheControl?: PutObjectRequest['CacheControl'];
	contentDisposition?: PutObjectRequest['ContentDisposition'];
	contentEncoding?: PutObjectRequest['ContentEncoding'];
	contentType?: PutObjectRequest['ContentType'];
	expires?: PutObjectRequest['Expires'];
	metadata?: PutObjectRequest['Metadata'];
	tagging?: PutObjectRequest['Tagging'];
}

export interface S3ClientServerSideEncryptionOptions {
	serverSideEncryption?: PutObjectRequest['ServerSideEncryption'];
	SSECustomerAlgorithm?: PutObjectRequest['SSECustomerAlgorithm'];
	SSECustomerKey?: PutObjectRequest['SSECustomerKey'];
	SSECustomerKeyMD5?: PutObjectRequest['SSECustomerKeyMD5'];
	SSEKMSKeyId?: PutObjectRequest['SSEKMSKeyId'];
}

export type S3ProviderPutOptions = StoragePutOptions &
	S3ClientPutOptions &
	StorageOptions;

export interface S3ProviderPutOutput {
	key: string;
}

export interface StorageRemoveOptions {
	bucket?: string;
	track?: boolean;
}

export type S3ProviderRemoveOptions = StorageRemoveOptions & StorageOptions;

export interface StorageListOptions {
	bucket?: string;
	track?: boolean;
	maxKeys?: number;
}

export interface S3ProviderListOutput {
	key: _Object['Key'];
	eTag: _Object['ETag'];
	lastModified: _Object['LastModified'];
	size: _Object['Size'];
}

export type S3ProviderListOptions = StorageListOptions & StorageOptions;

type StorageLevel = 'public' | 'protected' | 'private';

export type CopyProgress = {
	/** Total bytes copied */
	loaded: number;
	/** Total bytes to copy */
	total: number;
};

type S3ClientCopyCommandInput = S3ClientCopyCommandParams;

/** A subset of S3 CopyCommand params allowed for AWSS3Provider. */
interface S3ClientCopyCommandParams {
	bucket?: CopyObjectRequest['Bucket'];
	cacheControl?: CopyObjectRequest['CacheControl'];
	contentDisposition?: CopyObjectRequest['ContentDisposition'];
	contentLanguage?: CopyObjectRequest['ContentLanguage'];
	contentType?: CopyObjectRequest['ContentType'];
	expires?: CopyObjectRequest['Expires'];
	tagging?: CopyObjectRequest['Tagging'];
	acl?: CopyObjectRequest['ACL'];
	metadata?: CopyObjectRequest['Metadata'];
	serverSideEncryption?: CopyObjectRequest['ServerSideEncryption'];
	SSECustomerAlgorithm?: CopyObjectRequest['SSECustomerAlgorithm'];
	SSECustomerKey?: CopyObjectRequest['SSECustomerKey'];
	SSECustomerKeyMD5?: CopyObjectRequest['SSECustomerKeyMD5'];
	SSEKMSKeyId?: CopyObjectRequest['SSEKMSKeyId'];
}

interface StorageCopyConfig {
	level?: StorageLevel;
	/** if set to true, automatically sends Storage Events to Amazon Pinpoint */
	track?: boolean;
	provider?: string;
	/**
	 * callback function that gets called on each successful part copied to track
	 * the copy progress
	 **/
	progressCallback?: (progress: CopyProgress) => any;
}

export interface S3CopyTarget {
	key: string;
	level?: StorageLevel;
	identityId?: string;
}

export type S3CopySource = S3CopyTarget;

export type S3CopyDestination = Omit<S3CopyTarget, 'identityId'>;

export type CopyObjectConfig = S3ClientCopyCommandInput & StorageCopyConfig;

export type CopyResult = {
	key: string;
};
