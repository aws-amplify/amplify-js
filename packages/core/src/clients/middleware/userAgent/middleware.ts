import { UserAgent, UserAgentPair } from '@aws-sdk/types';
import { HttpRequest, HttpResponse } from '../../types/http';
import { Middleware } from '../../types/core';

export const UA_ESCAPE_REGEX = /[^\!\#\$\%\&\'\*\+\-\.\^\_\`\|\~\d\w]/g;

export interface UserAgentOptions {
	userAgentHeader?: string;
	userAgentValue?: string | UserAgent;
}

// TODO: incorporate new user agent design
export const userAgentMiddleware: Middleware<
	HttpRequest,
	HttpResponse,
	UserAgentOptions
> =
	({
		userAgentHeader = 'x-amz-user-agent',
		userAgentValue = '',
	}: UserAgentOptions) =>
	next => {
		return async function userAgentMiddleware(request) {
			const headerName = userAgentHeader.toLowerCase();
			if (userAgentValue instanceof Array) {
				const userAgentStringValue = userAgentValue
					.map(escapeUserAgent)
					.join(' ');
				request.headers[headerName] = request.headers[headerName]
					? `${request.headers[headerName]} ${userAgentStringValue}`
					: userAgentStringValue;
			} else if (
				typeof userAgentValue === 'string' &&
				userAgentValue.trim().length > 0
			) {
				request.headers[headerName] = request.headers[headerName]
					? `${request.headers[headerName]} ${userAgentValue}`
					: userAgentValue;
			}
			const result = await next(request);
			return result;
		};
	};

const escapeUserAgent = ([name, version]: UserAgentPair): string => {
	const prefixSeparatorIndex = name.indexOf('/');
	const prefix = name.substring(0, prefixSeparatorIndex); // If no prefix, prefix is just ""
	let uaName = name.substring(prefixSeparatorIndex + 1);
	if (prefix === 'api') {
		uaName = uaName.toLowerCase();
	}
	return [prefix, uaName, version]
		.filter(item => item && item.length > 0)
		.map(item => item?.replace(UA_ESCAPE_REGEX, '_'))
		.join('/');
};
