import { Endpoint } from './core';
import { HttpResponse } from './http';
export interface Credentials {
	accessKeyId: string;
	secretAccessKey: string;
	sessionToken?: string;
	expiration?: Date;
}

export type SourceData = string | ArrayBuffer | ArrayBufferView;

export interface ServiceClientOptions {
	region: string;
	endpointResolver: (input: { region: string }) => Endpoint;
}

/**
 * Load error code from given response. If no error code is found, return undefined.
 * This function is protocol-specific (e.g. JSON, XML, etc.)
 */
export type ErrorCodeLoader = (
	response?: HttpResponse
) => Promise<string | undefined>;
