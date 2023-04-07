import { RetryOptions } from '../middleware/retry';
import { Endpoint, Response } from './core';
export interface Credentials {
	accessKeyId: string;
	secretAccessKey: string;
	sessionToken?: string;
	expiration?: Date;
}

export type SourceData = string | ArrayBuffer | ArrayBufferView;

export interface ServiceClientOptions extends RetryOptions<Response> {
	region: string;
	endpointResolver: (input: { region: string }) => Endpoint;
}
