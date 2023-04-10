import { HttpResponse } from '../types/http';

export const parseMetadata = (response: HttpResponse) => ({
	httpStatusCode: response.statusCode,
	requestId:
		response.headers['x-amzn-requestid'] ??
		response.headers['x-amzn-request-id'] ??
		response.headers['x-amz-request-id'],
	extendedRequestId: response.headers['x-amz-id-2'],
	cfId: response.headers['x-amz-cf-id'],
});
