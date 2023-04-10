import { HttpResponse } from '../types/http';
import { parseMetadata } from './response-info';

export const parseBody = async (response: HttpResponse): Promise<any> => {
	if (!response.body) {
		throw new Error('Missing response payload');
	}
	const output = JSON.parse(await response.body.text());
	return Object.assign(output, {
		$metadata: parseMetadata(response),
	});
};

export const throwError = async (response: HttpResponse): Promise<never> => {
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
	const code = sanitizeErrorCode(
		response.headers['x-amzn-errortype'] ??
			body.code ??
			body.__type ??
			'UnknownError'
	);
	const message = body.message ?? body.Message ?? 'Unknown error';
	const error = new Error(message);
	throw Object.assign(error, {
		name: code,
		$metadata: parseMetadata(response),
	});
};
