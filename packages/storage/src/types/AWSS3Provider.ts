import { StorageLevel } from './Storage';
import { CopyObjectCommandInput } from '@aws-sdk/client-s3';

export type CopyProgress = {
	loaded: number;
	total: number;
};

type S3ClientCopyCommandInput =
	| ({
			cacheControl?: CopyObjectCommandInput['CacheControl'];
			contentDisposition?: CopyObjectCommandInput['ContentDisposition'];
			contentEncoding?: CopyObjectCommandInput['ContentEncoding'];
			contentLanguage?: CopyObjectCommandInput['ContentLanguage'];
			contentType?: CopyObjectCommandInput['ContentType'];
			expires?: CopyObjectCommandInput['Expires'];
			tagging?: CopyObjectCommandInput['Tagging'];
	  } & S3ClientServerSideEncryptionParams)
	| {
			cacheControl?: CopyObjectCommandInput['CacheControl'];
			contentDisposition?: CopyObjectCommandInput['ContentDisposition'];
			contentEncoding?: CopyObjectCommandInput['ContentEncoding'];
			contentLanguage?: CopyObjectCommandInput['ContentLanguage'];
			contentType?: CopyObjectCommandInput['ContentType'];
			expires?: CopyObjectCommandInput['Expires'];
			tagging?: CopyObjectCommandInput['Tagging'];
	  };

interface S3ClientServerSideEncryptionParams {
	serverSideEncryption: CopyObjectCommandInput['ServerSideEncryption'];
	SSECustomerAlgorithm?: CopyObjectCommandInput['SSECustomerAlgorithm'];
	SSECustomerKey?: CopyObjectCommandInput['SSECustomerKey'];
	SSECustomerKeyMD5?: CopyObjectCommandInput['SSECustomerKeyMD5'];
	SSEKMSKeyId?: CopyObjectCommandInput['SSEKMSKeyId'];
}

export type CopyObjectConfig = S3ClientCopyCommandInput & {
	bucket?: string;
	level?: StorageLevel;
	acl?: string;
	track?: boolean;
	multipart?: boolean;
	progressCallback?: (progress: CopyProgress) => any;
};

export type CopyResult = {
	key: string;
};
