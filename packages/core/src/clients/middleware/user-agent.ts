import { HttpRequest, HttpResponse } from '../types/http';
import { Middleware } from '../types/core';

export interface UserAgentOptions {
	userAgentHeader?: string;
	userAgentValue?: string;
}

// TODO: incorporate new user agent design
export const userAgent: Middleware<
	HttpRequest,
	HttpResponse,
	UserAgentOptions
> = (options: UserAgentOptions) => next => {
	return async function userAgent(request) {
		const userAgentValue = (options.userAgentValue ?? '').trim();
		if (userAgentValue.length === 0) {
			return await next(request);
		} else {
			const headerName =
				options.userAgentHeader?.toLowerCase() ?? 'x-amz-user-agent';
			if (request.headers[headerName]) {
				request.headers[
					headerName
				] = `${request.headers[headerName]} ${userAgentValue}`;
			} else {
				request.headers[headerName] = userAgentValue;
			}
			const response = await next(request);
			return response;
		}
	};
};
