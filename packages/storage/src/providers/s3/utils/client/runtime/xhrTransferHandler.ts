// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	HttpRequest,
	HttpResponse,
	ResponseBodyMixin,
	TransferHandler,
	withMemoization,
} from '@aws-amplify/core/internals/aws-client-utils';
import { ConsoleLogger } from '@aws-amplify/core';

import { TransferProgressEvent } from '../../../../../types/common';
import { CanceledError } from '../../../../../errors/CanceledError';
import { StorageError } from '../../../../../errors/StorageError';

import {
	ABORT_ERROR_CODE,
	ABORT_ERROR_MESSAGE,
	CANCELED_ERROR_CODE,
	CANCELED_ERROR_MESSAGE,
	NETWORK_ERROR_CODE,
	NETWORK_ERROR_MESSAGE,
} from './constants';

const logger = new ConsoleLogger('xhr-http-handler');

/**
 * @internal
 */
export interface XhrTransferHandlerOptions {
	// Expected response body type. If `blob`, the response will be returned as a Blob object. It's mainly used to
	// download binary data. Otherwise, use `text` to return the response as a string.
	responseType: 'text' | 'blob';
	abortSignal?: AbortSignal;
	onDownloadProgress?(event: TransferProgressEvent): void;
	onUploadProgress?(event: TransferProgressEvent): void;
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
	const { onDownloadProgress, onUploadProgress, responseType, abortSignal } =
		options;

	return new Promise((resolve, reject) => {
		let xhr: XMLHttpRequest | null = new XMLHttpRequest();
		xhr.open(method.toUpperCase(), url.toString());

		Object.entries(headers)
			.filter(([header]) => !FORBIDDEN_HEADERS.includes(header))
			.forEach(([header, value]) => {
				xhr!.setRequestHeader(header, value);
			});

		xhr.responseType = responseType;

		if (onDownloadProgress) {
			xhr.addEventListener('progress', event => {
				onDownloadProgress(convertToTransferProgressEvent(event));
				logger.debug(event);
			});
		}
		if (onUploadProgress) {
			xhr.upload.addEventListener('progress', event => {
				onUploadProgress(convertToTransferProgressEvent(event));
				logger.debug(event);
			});
		}

		xhr.addEventListener('error', () => {
			const networkError = new StorageError({
				message: NETWORK_ERROR_MESSAGE,
				name: NETWORK_ERROR_CODE,
			});
			logger.error(NETWORK_ERROR_MESSAGE);
			reject(networkError);
			xhr = null; // clean up request
		});

		// Handle browser request cancellation (as opposed to a manual cancellation)
		xhr.addEventListener('abort', () => {
			// The abort event can be triggered after the error or load event. So we need to check if the xhr is null.
			// When request is aborted by AbortSignal, the promise is rejected in the abortSignal's 'abort' event listener.
			if (!xhr || abortSignal?.aborted) return;
			// Handle abort request caused by browser instead of AbortController
			// see: https://github.com/axios/axios/issues/537
			const error = buildHandlerError(ABORT_ERROR_MESSAGE, ABORT_ERROR_CODE);
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
					xhr.getAllResponseHeaders(),
				);
				const { responseType: loadEndResponseType } = xhr;
				const responseBlob = xhr.response as Blob;
				const responseText =
					loadEndResponseType === 'text' ? xhr.responseText : '';
				const bodyMixIn: ResponseBodyMixin = {
					blob: () => Promise.resolve(responseBlob),
					text: withMemoization(() =>
						loadEndResponseType === 'blob'
							? readBlobAsText(responseBlob)
							: Promise.resolve(responseText),
					),
					json: () =>
						Promise.reject(
							// S3 does not support JSON response. So fail-fast here with nicer error message.
							new Error(
								'Parsing response to JSON is not implemented. Please use response.text() instead.',
							),
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
			const onCanceled = () => {
				// The abort event is triggered after the error or load event. So we need to check if the xhr is null.
				if (!xhr) {
					return;
				}
				const canceledError = new CanceledError({
					name: CANCELED_ERROR_CODE,
					message: CANCELED_ERROR_MESSAGE,
				});
				reject(canceledError);
				xhr.abort();
				xhr = null;
			};
			abortSignal.aborted
				? onCanceled()
				: abortSignal.addEventListener('abort', onCanceled);
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

const convertToTransferProgressEvent = (
	event: ProgressEvent,
): TransferProgressEvent => ({
	transferredBytes: event.loaded,
	totalBytes: event.lengthComputable ? event.total : undefined,
});

const buildHandlerError = (message: string, name: string): Error => {
	const error = new Error(message);
	error.name = name;

	return error;
};

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
