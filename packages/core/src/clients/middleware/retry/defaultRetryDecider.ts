import { HttpResponse, ErrorParser } from '../../types';

/**
 * Get retry decider function
 * @param errorParser Function to load JavaScript error from HTTP response
 */
export const getRetryDecider =
	(errorParser: ErrorParser) =>
	async (response?: HttpResponse, error?: Error): Promise<boolean> => {
		const errorFromResponse = error ?? (await errorParser(response));
		const statusCode = response?.statusCode;
		return (
			isConnectionError(error) ||
			isThrottlingError(statusCode, errorFromResponse.name) ||
			isClockSkewError(errorFromResponse.name) ||
			isServerSideError(statusCode, errorFromResponse.name)
		);
	};

// reference: https://github.com/aws/aws-sdk-js-v3/blob/ab0e7be36e7e7f8a0c04834357aaad643c7912c3/packages/service-error-classification/src/constants.ts#L22-L37
const THROTTLING_ERROR_CODES = [
	'BandwidthLimitExceeded',
	'EC2ThrottledException',
	'LimitExceededException',
	'PriorRequestNotComplete',
	'ProvisionedThroughputExceededException',
	'RequestLimitExceeded',
	'RequestThrottled',
	'RequestThrottledException',
	'SlowDown',
	'ThrottledException',
	'Throttling',
	'ThrottlingException',
	'TooManyRequestsException',
];

const CLOCK_SKEW_ERROR_CODES = [
	'AuthFailure',
	'InvalidSignatureException',
	'RequestExpired',
	'RequestInTheFuture',
	'RequestTimeTooSkewed',
	'SignatureDoesNotMatch',
	'BadRequestException', // API Gateway
];

const TIMEOUT_ERROR_CODES = [
	'TimeoutError',
	'RequestTimeout',
	'RequestTimeoutException',
];

const isThrottlingError = (statusCode?: number, errorCode?: string) =>
	statusCode === 429 || THROTTLING_ERROR_CODES.includes(errorCode);

const isConnectionError = (error?: Error) => error?.name === 'Network error';

const isClockSkewError = (errorCode?: string) =>
	CLOCK_SKEW_ERROR_CODES.includes(errorCode);

const isServerSideError = (statusCode?: number, errorCode?: string) =>
	[500, 502, 503, 504].includes(statusCode) ||
	TIMEOUT_ERROR_CODES.includes(errorCode);
