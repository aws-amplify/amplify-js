import { StorageLevel } from './Storage';

export type CopyProgress = {
	loaded: number;
	total: number;
};

export interface CopyObjectConfig {
	bucket: string;
	level?: StorageLevel;
	acl?: string;
	cacheControl?: string;
	contentDisposition?: string;
	contentEncoding?: string;
	contentLanguage?: string;
	contentType?: string;
	expires?: Date;
	track?: boolean;
	progressCallback?: (progress: CopyProgress) => any;
	serverSideEncryption?: string;
	SSECustomerAlgorithm?: string;
	SSECustomerKey?: string;
	SSECustomerKeyMD5?: string;
	SSEKMSKeyId?: string;
}

export type CopyResult = {
	key: string;
};
