import { StorageLevel } from './Storage';
import { CopyObjectCommandInput } from '@aws-sdk/client-s3';

export type CopyProgress = {
	loaded: number;
	total: number;
};

export interface CopyObjectConfig {
	bucket?: string;
	level?: StorageLevel;
	acl?: string;
	track?: boolean;
	progressCallback?: (progress: CopyProgress) => any;
	cacheControl?: CopyObjectCommandInput['CacheControl'];
	contentDisposition?: CopyObjectCommandInput['ContentDisposition'];
	contentEncoding?: CopyObjectCommandInput['ContentEncoding'];
	contentLanguage?: CopyObjectCommandInput['ContentLanguage'];
	contentType?: CopyObjectCommandInput['ContentType'];
	expires?: CopyObjectCommandInput['Expires'];
	tagging?: CopyObjectCommandInput['Tagging'];
	serverSideEncryption?: CopyObjectCommandInput['ServerSideEncryption'];
	SSECustomerAlgorithm?: CopyObjectCommandInput['SSECustomerAlgorithm'];
	SSECustomerKey?: CopyObjectCommandInput['SSECustomerKey'];
	SSECustomerKeyMD5?: CopyObjectCommandInput['SSECustomerKeyMD5'];
	SSEKMSKeyId?: CopyObjectCommandInput['SSEKMSKeyId'];
}

export type CopyResult = {
	key: string;
};
