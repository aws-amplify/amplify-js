// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Headers, HttpResponse } from '@aws-amplify/core/lib-esm/clients';

/**
 * RestClient instance options
 */
export class RestClientOptions {
	/** AWS credentials */
	credentials: AWSCredentials;

	/**
	 * Lookup key of AWS credentials.
	 * If credentials not provided then lookup from sessionStorage.
	 * Default 'awsCredentials'
	 */
	credentials_key: string;

	/** Additional headers for all requests send by this client. e.g. user-agent */
	headers: object;

	constructor() {
		this.credentials_key = 'awsCredentials';
		this.headers = {};
	}
}

export type DocumentType =
	| null
	| boolean
	| number
	| string
	| DocumentType[]
	| { [prop: string]: DocumentType };

/**
 * AWS credentials needed for RestClient
 */
export class AWSCredentials {
	/**
	 * Secret Access Key
	 *
	 * [Access Key ID and Secret Access Key]
	 * (http://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys)
	 */
	secretAccessKey: string;

	/**
	 * Access Key ID
	 *
	 * [Access Key ID and Secret Access Key]
	 * (http://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys)
	 */
	accessKeyId: string;

	/** Access Token of current session */
	sessionToken: string;
}

// TODO: remove this once unauth creds are figured out
export interface apiOptions {
	headers: Headers;
	endpoints: object;
	credentials?: object;
}

export type ApiInfo = {
	endpoint: string;
	region?: string;
	service?: string;
	custom_header?: () => { [key: string]: string };
};

export type GetOperation = Operation<HttpResponse>;
export type PostOperation = Operation<HttpResponse>;
export type PutOperation = Operation<HttpResponse>;
export type PatchOperation = Operation<HttpResponse>;
export type DeleteOperation = Omit<
	Operation<Omit<HttpResponse, 'body'>>,
	'cancel'
>;
export type HeadOperation = Omit<
	Operation<Omit<HttpResponse, 'body'>>,
	'cancel'
>;

export type GetOptions = RestApiOptionsBase;
export type PostOptions = RestApiOptionsBase;
export type PutOptions = RestApiOptionsBase;
export type PatchOptions = RestApiOptionsBase;
export type DeleteOptions = Omit<RestApiOptionsBase, 'body'>;
export type HeadOptions = Omit<RestApiOptionsBase, 'body'>;

type Operation<Response> = {
	response: Promise<Response>;
	cancel: (customCancelError?: Error) => void;
};

type RestApiOptionsBase = {
	headers?: Headers;
	queryParams?: Record<string, string>;
	body?: DocumentType;
};
