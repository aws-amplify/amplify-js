import { ErrorCodeLoader, HttpResponse } from '../types';
import { parseMetadata } from './responseInfo';

/**
 * Error code loader for AWS JSON protocol.
 */
export const loadJsonErrorCode: ErrorCodeLoader = async (
	response?: HttpResponse
) => {
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
	return sanitizeErrorCode(
		response.headers['x-amzn-errortype'] ?? body.code ?? body.__type
	);
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

export const throwJsonError = async (
	response: HttpResponse
): Promise<never> => {
	const body = await parseJsonBody(response);
	const code = (await loadJsonErrorCode(response)) ?? 'UnknownError';
	const message = body.message ?? body.Message ?? 'Unknown error';
	const error = new Error(message);
	throw Object.assign(error, {
		name: code,
		$metadata: parseMetadata(response),
	});
};
