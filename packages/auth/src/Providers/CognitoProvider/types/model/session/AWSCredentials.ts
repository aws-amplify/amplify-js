export type AWSCredentials = {
	accessKeyId: string;
	secretAccessKey: string;
	sessionToken?: string;
	expiration: Date;
};
