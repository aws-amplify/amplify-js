import {
	GetObjectRequest,
	GetObjectCommandOutput,
	PutObjectRequest,
	CopyObjectRequest,
	_Object,
	DeleteObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { StorageOptions, StorageLevel } from './Storage';

type ListObjectsCommandOutputContent = _Object;

export type CommonStorageOptions = Omit<
	StorageOptions,
	'credentials' | 'region' | 'bucket' | 'dangerouslyConnectToHttpEndpointForTesting'
>;

export type S3ProviderGetConfig = CommonStorageOptions & {
	download?: boolean;
	track?: boolean;
	expires?: number;
	provider?: 'AWSS3';
	progressCallback?: (progress: any) => any;
	cacheControl?: GetObjectRequest['ResponseCacheControl'];
	contentDisposition?: GetObjectRequest['ResponseContentDisposition'];
	contentEncoding?: GetObjectRequest['ResponseContentEncoding'];
	contentLanguage?: GetObjectRequest['ResponseContentLanguage'];
	contentType?: GetObjectRequest['ResponseContentType'];
	SSECustomerAlgorithm?: GetObjectRequest['SSECustomerAlgorithm'];
	SSECustomerKey?: GetObjectRequest['SSECustomerKey'];
	SSECustomerKeyMD5?: GetObjectRequest['SSECustomerKeyMD5'];
};

export type S3ProviderGetOuput<T> = T extends { download: true } ? GetObjectCommandOutput : string;

export type S3ProviderPutConfig = CommonStorageOptions & {
	progressCallback?: (progress: any) => any;
	provider?: 'AWSS3';
	track?: boolean;
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
	useAccelerateEndpoint?: boolean;
}

export interface S3ProviderPutOutput {
	key: string;
}

export type S3ProviderRemoveConfig = CommonStorageOptions & { bucket?: string; provider?: 'AWSS3' };

export type S3ProviderRemoveOutput = DeleteObjectCommandOutput;

export type S3ProviderListConfig = CommonStorageOptions & {
	bucket?: string;
	maxKeys?: number;
	provider?: 'AWSS3';
};

export interface S3ProviderListOutputItem {
	key: ListObjectsCommandOutputContent['Key'];
	eTag: ListObjectsCommandOutputContent['ETag'];
	lastModified: ListObjectsCommandOutputContent['LastModified'];
	size: ListObjectsCommandOutputContent['Size'];
}

export type S3ProviderListOutput = S3ProviderListOutputItem[];

export interface S3CopyTarget {
	key: string;
	level?: StorageLevel;
	identityId?: string;
}

export type S3CopySource = S3CopyTarget;

export type S3CopyDestination = Omit<S3CopyTarget, 'identityId'>;

export type S3ProviderCopyConfig = Omit<CommonStorageOptions, 'level'> & {
	provider?: 'AWSS3';
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
};

export type S3ProviderCopyOutput = {
	key: string;
};
