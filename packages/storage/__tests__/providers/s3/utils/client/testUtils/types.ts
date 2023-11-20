// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpRequest } from '@aws-amplify/core/internals/aws-client-utils';

type MockFetchResponse = {
	body: BodyInit;
	headers: HeadersInit;
	status: number;
};

// TODO: remove this after upgrading ts-jest
type Awaited<T> = T extends PromiseLike<infer U> ? U : never;

type ApiFunctionalTestHappyCase<ApiHandler extends (...args: any) => any> = [
	'happy case',
	string, // name
	ApiHandler, // handler
	Parameters<ApiHandler>[0], // config
	Parameters<ApiHandler>[1], // input
	HttpRequest, // expected request
	MockFetchResponse, // response
	Awaited<ReturnType<ApiHandler>> // expected output
];

type ApiFunctionalTestErrorCase<ApiHandler extends (...args: any) => any> = [
	'error case',
	string, // name
	ApiHandler, // handler
	Parameters<ApiHandler>[0], // config
	Parameters<ApiHandler>[1], // input
	HttpRequest, // expected request
	MockFetchResponse, // response
	{} // error
];

/**
 * A test case for an API handler.
 *
 * @internal
 */
export type ApiFunctionalTestCase<ApiHandler extends (...args: any) => any> =
	| ApiFunctionalTestHappyCase<ApiHandler>
	| ApiFunctionalTestErrorCase<ApiHandler>;

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Type definition for XMLHttpRequest's progress event with only the properties we care about.
 *
 * @internal
 */
export type XhrProgressEvent = Pick<
	ProgressEvent<XMLHttpRequestEventTarget>,
	'loaded' | 'total' | 'lengthComputable'
>;

/**
 * A spy for XMLHttpRequest instance including attached listeners to xhr instance and upload instance.
 *
 * @internal
 */
export type XhrSpy = Writeable<XMLHttpRequest> & {
	uploadListeners: Partial<{
		[name in keyof XMLHttpRequestEventTargetEventMap]: Array<
			(event: XMLHttpRequestEventTargetEventMap[name]) => void
		>;
	}>;
	listeners: Partial<{
		[name in keyof XMLHttpRequestEventMap]: Array<
			(event: XMLHttpRequestEventMap[name]) => void
		>;
	}>;
};
