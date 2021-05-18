export enum AccessLevel {
	Public = 'public',
	Private = 'private',
	Protected = 'protected',
}

export interface StorageObject {
	key: string;
	contentType?: string;
	eTag?: string;
	lastModified?: Date;
	size?: number;
}
