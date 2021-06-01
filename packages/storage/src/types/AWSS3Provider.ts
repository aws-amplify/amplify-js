import { StorageLevel } from './Storage';
import { CopyObjectRequest } from '@aws-sdk/client-s3';

export type CopyProgress = {
	loaded: number;
	total: number;
};

type S3ClientCopyCommandInput =
	| (S3ClientCopyCommandParams & S3ClientServerSideEncryptionParams)
	| S3ClientCopyCommandParams;

/** A subset of S3 CopyCommand params allowed for AWSS3Provider. */
interface S3ClientCopyCommandParams {
	bucket?: CopyObjectRequest['Bucket'];
	cacheControl?: CopyObjectRequest['CacheControl'];
	contentDisposition?: CopyObjectRequest['ContentDisposition'];
	contentEncoding?: CopyObjectRequest['ContentEncoding'];
	contentLanguage?: CopyObjectRequest['ContentLanguage'];
	contentType?: CopyObjectRequest['ContentType'];
	expires?: CopyObjectRequest['Expires'];
	tagging?: CopyObjectRequest['Tagging'];
	acl?: CopyObjectRequest['ACL'];
}

interface S3ClientServerSideEncryptionParams {
	serverSideEncryption: CopyObjectRequest['ServerSideEncryption'];
	SSECustomerAlgorithm?: CopyObjectRequest['SSECustomerAlgorithm'];
	SSECustomerKey?: CopyObjectRequest['SSECustomerKey'];
	SSECustomerKeyMD5?: CopyObjectRequest['SSECustomerKeyMD5'];
	SSEKMSKeyId?: CopyObjectRequest['SSEKMSKeyId'];
}

interface StorageCopyConfig {
	level?: StorageLevel;
	track?: boolean;
	multipart?: boolean;
	provider?: string;
	progressCallback?: (progress: CopyProgress) => any;
}

export type CopyObjectConfig = S3ClientCopyCommandInput & StorageCopyConfig;

export type CopyResult = {
	key: string;
};
