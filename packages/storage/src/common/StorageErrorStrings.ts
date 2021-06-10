export enum StorageErrorStrings {
	NO_CREDENTIALS = 'No credentials',
}

export enum AWSS3ProviderMultipartCopierErrors {
	CLEANUP_FAILED = 'Multipart copy clean up failed',
	NO_OBJECT_FOUND = 'Object does not exist',
	INVALID_QUEUESIZE = 'Queue size must be a positive number',
	NO_COPYSOURCE = 'You must specify a copy source',
	MAX_NUM_PARTS_EXCEEDED = 'Only a maximum of 10000 parts are allowed',
}
