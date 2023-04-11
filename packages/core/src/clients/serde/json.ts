import { ErrorCodeLoader, HttpResponse } from '../types';
import { parseMetadata } from './response-info';

/**
 * Error code loader for AWS JSON protocol.
 */
export const loadErrorCode: ErrorCodeLoader = async (
	response: HttpResponse
) => {
	if (response.statusCode < 300) {
		return undefined;
	}
	const body = await parseBody(response);
	const sanitizeErrorCode = (rawValue: string | number): string => {
		let cleanValue = rawValue;
		if (typeof cleanValue === 'number') {
			cleanValue = cleanValue.toString();
		}
		if (cleanValue.indexOf(',') >= 0) {
			cleanValue = cleanValue.split(',')[0];
		}
		if (cleanValue.indexOf(':') >= 0) {
			cleanValue = cleanValue.split(':')[0];
		}
		if (cleanValue.indexOf('#') >= 0) {
			cleanValue = cleanValue.split('#')[1];
		}
		return cleanValue;
	};
	return sanitizeErrorCode(
		response.headers['x-amzn-errortype'] ?? body.code ?? body.__type
	);
};

export const parseBody = async (response: HttpResponse): Promise<any> => {
	if (!response.body) {
		throw new Error('Missing response payload');
	}
	const output = await response.body.json();
	return Object.assign(output, {
		$metadata: parseMetadata(response),
	});
};

export const throwError = async (response: HttpResponse): Promise<never> => {
	const body = await parseBody(response);
	const code = (await loadErrorCode(response)) ?? 'UnknownError';
	const message = body.message ?? body.Message ?? 'Unknown error';
	const error = new Error(message);
	throw Object.assign(error, {
		name: code,
		$metadata: parseMetadata(response),
	});
};
