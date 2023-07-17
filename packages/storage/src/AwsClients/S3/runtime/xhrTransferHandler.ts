// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	HttpRequest,
	HttpResponse,
	TransferHandler,
	ResponseBodyMixin,
	withMemoization,
} from '@aws-amplify/core/internals/aws-client-utils';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import type { EventEmitter } from 'events';
import {
	SEND_DOWNLOAD_PROGRESS_EVENT,
	SEND_UPLOAD_PROGRESS_EVENT,
	ABORT_ERROR_CODE,
	ABORT_ERROR_MESSAGE,
	CANCELED_ERROR_CODE,
	CANCELED_ERROR_MESSAGE,
	NETWORK_ERROR_CODE,
	NETWORK_ERROR_MESSAGE,
} from './constants';

const logger = new Logger('xhr-http-handler');

/**
 * @internal
 */
export interface XhrTransferHandlerOptions {
	// Expected response body type. If `blob`, the response will be returned as a Blob object. It's mainly used to
	// download binary data. Otherwise, use `text` to return the response as a string.
	responseType: 'text' | 'blob';
	abortSignal?: AbortSignal;
	emitter?: EventEmitter;
}

/**
 * Base transfer handler implementation using XMLHttpRequest to support upload and download progress events.
 *
 * @param request - The request object.
 * @param options - The request options.
 * @returns A promise that will be resolved with the response object.
 *
 * @internal
 */
export const xhrTransferHandler: TransferHandler<
	HttpRequest,
	HttpResponse,
	XhrTransferHandlerOptions
> = (request, options): Promise<HttpResponse> => {
	const { url, method, headers, body } = request;
	const { emitter, responseType, abortSignal } = options;

	return new Promise((resolve, reject) => {
		let xhr: XMLHttpRequest | null = new XMLHttpRequest();
		xhr.open(method.toUpperCase(), url.toString());

		Object.entries(headers)
			.filter(([header]) => !FORBIDDEN_HEADERS.includes(header))
			.forEach(([header, value]) => {
				xhr!.setRequestHeader(header, value);
			});

		xhr.responseType = responseType;

		if (emitter) {
			xhr.upload.addEventListener('progress', event => {
				emitter.emit(SEND_UPLOAD_PROGRESS_EVENT, event);
				logger.debug(event);
			});
			xhr.addEventListener('progress', event => {
				emitter.emit(SEND_DOWNLOAD_PROGRESS_EVENT, event);
				logger.debug(event);
			});
		}

		xhr.addEventListener('error', () => {
			const error = simulateAxiosError(
				NETWORK_ERROR_MESSAGE,
				NETWORK_ERROR_CODE,
				xhr!,
				options
			);
			logger.error(NETWORK_ERROR_MESSAGE);
			reject(error);
			xhr = null; // clean up request
		});

		// Handle browser request cancellation (as opposed to a manual cancellation)
		xhr.addEventListener('abort', () => {
			// The abort event can be triggered after the error or load event. So we need to check if the xhr is null.
			if (!xhr || abortSignal?.aborted) return;
			const error = simulateAxiosError(
				ABORT_ERROR_MESSAGE,
				ABORT_ERROR_CODE,
				xhr,
				options
			);
			logger.error(ABORT_ERROR_MESSAGE);
			reject(error);
			xhr = null; // clean up request
		});

		// Skip handling timeout error since we don't have a timeout

		xhr.addEventListener('readystatechange', () => {
			if (!xhr || xhr.readyState !== xhr.DONE) {
				return;
			}

			const onloadend = () => {
				// The load event is triggered after the error/abort/load event. So we need to check if the xhr is null.
				if (!xhr) return;
				const responseHeaders = convertResponseHeaders(
					xhr.getAllResponseHeaders()
				);
				const responseType = xhr.responseType;
				const responseBlob = xhr.response as Blob;
				const responseText = responseType === 'text' ? xhr.responseText : '';
				const bodyMixIn: ResponseBodyMixin = {
					blob: () => Promise.resolve(responseBlob),
					text: withMemoization(() =>
						responseType === 'blob'
							? readBlobAsText(responseBlob)
							: Promise.resolve(responseText)
					),
					json: () =>
						Promise.reject(
							// S3 does not support JSON response. So fail-fast here with nicer error message.
							new Error(
								'Parsing response to JSON is not implemented. Please use response.text() instead.'
							)
						),
				};
				const response: HttpResponse = {
					statusCode: xhr.status,
					headers: responseHeaders,
					// The xhr.responseType is only set to 'blob' for streaming binary S3 object data. The streaming data is
					// exposed via public interface of Storage.get(). So we need to return the response as a Blob object for
					// backward compatibility. In other cases, the response payload is only used internally, we return it is
					// {@link ResponseBodyMixin}
					body: (xhr.responseType === 'blob'
						? Object.assign(responseBlob, bodyMixIn)
						: bodyMixIn) as HttpResponse['body'],
				};
				resolve(response);
				xhr = null; // clean up request
			};

			// readystate handler is calling before onerror or ontimeout handlers,
			// so we should call onloadend on the next 'tick'
			// @see https://github.com/axios/axios/blob/9588fcdec8aca45c3ba2f7968988a5d03f23168c/lib/adapters/xhr.js#L98-L99
			setTimeout(onloadend);
		});

		if (abortSignal) {
			const onCancelled = () => {
				// The abort event is triggered after the error or load event. So we need to check if the xhr is null.
				if (!xhr) {
					return;
				}
				const canceledError = simulateAxiosCanceledError(
					CANCELED_ERROR_MESSAGE ?? abortSignal.reason,
					CANCELED_ERROR_CODE,
					xhr,
					options
				);
				xhr.abort();
				reject(canceledError);
				xhr = null;
			};
			abortSignal.aborted
				? onCancelled()
				: abortSignal.addEventListener('abort', onCancelled);
		}

		if (
			typeof ReadableStream === 'function' &&
			body instanceof ReadableStream
		) {
			// This does not matter as previous implementation uses Axios which does not support ReadableStream anyway.
			throw new Error('ReadableStream request payload is not supported.');
		}

		xhr.send((body as Exclude<BodyInit, ReadableStream>) ?? null);
	});
};

// TODO: V6 remove this
const simulateAxiosError = (
	message: string,
	code: string,
	request: XMLHttpRequest,
	config: XhrTransferHandlerOptions
) =>
	Object.assign(new Error(message), {
		code,
		config,
		request,
	});

const simulateAxiosCanceledError = (
	message: string,
	code: string,
	request: XMLHttpRequest,
	config: XhrTransferHandlerOptions
) => {
	const error = simulateAxiosError(message, code, request, config);
	error.name = 'CanceledError';
	error['__CANCEL__'] = true;
	return error;
};

export const isCancelError = (error: unknown): boolean =>
	!!error?.['__CANCEL__'];
/**
 * Convert xhr.getAllResponseHeaders() string to a Record<string, string>. Note that modern browser already returns
 * header names in lowercase.
 * @param xhrHeaders - string of headers returned from xhr.getAllResponseHeaders()
 */
const convertResponseHeaders = (xhrHeaders: string): Record<string, string> => {
	if (!xhrHeaders) {
		return {};
	}
	return xhrHeaders
		.split('\r\n')
		.reduce((headerMap: Record<string, string>, line: string) => {
			const parts = line.split(': ');
			const header = parts.shift()!;
			const value = parts.join(': ');
			headerMap[header.toLowerCase()] = value;
			return headerMap;
		}, {});
};

const readBlobAsText = (blob: Blob) => {
	const reader = new FileReader();
	return new Promise<string>((resolve, reject) => {
		reader.onloadend = () => {
			if (reader.readyState !== FileReader.DONE) {
				return;
			}
			resolve(reader.result as string);
		};
		reader.onerror = () => {
			reject(reader.error);
		};
		reader.readAsText(blob);
	});
};

// To add more forbidden headers as found set by S3. Intentionally NOT list all of them here to save bundle size.
// https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name
const FORBIDDEN_HEADERS = ['host'];
