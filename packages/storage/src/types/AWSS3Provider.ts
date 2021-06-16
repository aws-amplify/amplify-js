import { CopyObjectRequest } from '@aws-sdk/client-s3';

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
