import { ErrorParser, HttpResponse } from '../types';
import { parseMetadata } from './responseInfo';

/**
 * Utility functions for serializing and deserializing of JSON protocol in general(including: REST-JSON, JSON-RPC, etc.)
 * The utility functions here must be mindful of only reading the response body once for each response in any
 * deserializer code path.
 */

/**
 * Error parser for AWS JSON protocol.
 */
export const parseJsonError: ErrorParser = async (response?: HttpResponse) => {
	if (!response || response.statusCode < 300) {
		return;
	}
	const body = await parseJsonBody(response);
	const sanitizeErrorCode = (rawValue: string | number): string => {
		let cleanValue = rawValue.toString();
		if (cleanValue.includes(',')) {
			[cleanValue] = cleanValue.split(',');
		}
		if (cleanValue.includes(':')) {
			[cleanValue] = cleanValue.split(':');
		}
		if (cleanValue.includes('#')) {
			[cleanValue] = cleanValue.split('#');
		}
		return cleanValue;
	};
	const code = sanitizeErrorCode(
		response.headers['x-amzn-errortype'] ??
			body.code ??
			body.__type ??
			'UnknownError'
	);
	const message = body.message ?? body.Message ?? 'Unknown error';
	const error = new Error(message);
	return Object.assign(error, {
		name: code,
		$metadata: parseMetadata(response),
	});
};

export const parseJsonBody = async (response: HttpResponse): Promise<any> => {
	if (!response.body) {
		throw new Error('Missing response payload');
	}
	const output = await response.body.json();
	return Object.assign(output, {
		$metadata: parseMetadata(response),
	});
};
