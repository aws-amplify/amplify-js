import { retry, RetryOptions } from '../middleware/retry';
import { composeTransferHandler } from '../internal/composeTransferHandler';
import { fetchTransferHandler } from './fetch';
import { HttpRequest, HttpResponse } from '../types';
import { userAgent, UserAgentOptions } from '../middleware/user-agent';

export const unAuthenticatedHandler = composeTransferHandler<
	[UserAgentOptions, RetryOptions<HttpResponse>],
	HttpRequest,
	HttpResponse
>(fetchTransferHandler, [userAgent, retry]);
