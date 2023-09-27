// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Type representing a plain JavaScript object that can be serialized to JSON.
 */
export type DocumentType =
	| null
	| boolean
	| number
	| string
	| DocumentType[]
	| { [prop: string]: DocumentType };

// export declare const get: (input: ApiInput<GetOptions>) => GetOperation;

// export declare const del: (input: ApiInput<DeleteOptions>) => DeleteOperation;

// export declare const put: (input: ApiInput<PutOptions>) => PutOperation;

// export declare const patch: (input: ApiInput<PatchOptions>) => PatchOperation;

// export declare const post: (input: ApiInput<PostOptions>) => PostOperation;

// export declare const head: (input: ApiInput<HeadOptions>) => HeadOperation;

export type GetOptions = RestApiOptionsBase;
export type PostOptions = RestApiOptionsBase;
export type PutOptions = RestApiOptionsBase;
export type PatchOptions = RestApiOptionsBase;
export type DeleteOptions = Omit<RestApiOptionsBase, 'body'>;
export type HeadOptions = Omit<RestApiOptionsBase, 'body'>;

export type GetOperation = Operation<RestApiResponse>;
export type PostOperation = Operation<RestApiResponse>;
export type PutOperation = Operation<RestApiResponse>;
export type PatchOperation = Operation<RestApiResponse>;
export type DeleteOperation = Operation<Omit<RestApiResponse, 'body'>>;
export type HeadOperation = Operation<Omit<RestApiResponse, 'body'>>;

export type RestApiOptionsBase = {
	headers?: Headers;
	queryParams?: Record<string, string>;
	body?: DocumentType | FormData;
	withCredentials?: boolean;
};

type Headers = Record<string, string>;

export type Operation<Response> = {
	response: Promise<Response>;
	cancel: (abortMessage?: string) => void;
};

type ResponsePayload = {
	blob: () => Promise<Blob>;
	json: () => Promise<any>;
	text: () => Promise<string>;
};
export interface RestApiResponse {
	body: ResponsePayload;
	statusCode: number;
	headers: Headers;
}

type ApiInput<Options> = {
	apiName: string;
	path: string;
	options?: Options;
};
