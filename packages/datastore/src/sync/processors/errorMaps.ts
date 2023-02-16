import { ErrorType } from '../../types';

export type ErrorMap = Partial<{
	[key in ErrorType]: (error: Error) => boolean;
}>;

const connectionTimeout = error =>
	/^Connection failed: Connection Timeout/.test(error.message);

const serverError = error =>
	/^Error: Request failed with status code 5\d\d/.test(error.message);

export const mutationErrorMap: ErrorMap = {
	BadModel: () => false,
	BadRecord: error => {
		const { message } = error;
		return (
			/^Cannot return \w+ for [\w-_]+ type/.test(message) ||
			/^Variable '.+' has coerced Null value for NonNull type/.test(message)
		); // newly required field, out of date client
	},
	ConfigError: () => false,
	Transient: error => connectionTimeout(error) || serverError(error),
	Unauthorized: error =>
		/^Request failed with status code 401/.test(error.message),
};

export const subscriptionErrorMap: ErrorMap = {
	BadModel: () => false,
	BadRecord: () => false,
	ConfigError: () => false,
	Transient: observableError => {
		const error = unwrapObservableError(observableError);
		return connectionTimeout(error) || serverError(error);
	},
	Unauthorized: observableError => {
		const error = unwrapObservableError(observableError);
		return /Connection failed.+Unauthorized/.test(error.message);
	},
};

export const syncErrorMap: ErrorMap = {
	BadModel: () => false,
	BadRecord: error => /^Cannot return \w+ for [\w-_]+ type/.test(error.message),
	ConfigError: () => false,
	Transient: error => connectionTimeout(error) || serverError(error),
	Unauthorized: () => false,
};

/**
 * Get the first error reason of an observable.
 * Allows for error maps to be easily applied to observable errors
 *
 * @param observableError an error from ZenObservable subscribe error callback
 */
function unwrapObservableError(observableError: any) {
	const {
		error: { errors: [error] } = {
			errors: [],
		},
	} = observableError;

	return error;
}

export function getMutationErrorType(error: Error): ErrorType {
	return mapErrorToType(mutationErrorMap, error);
}

export function getSubscriptionErrorType(error: Error): ErrorType {
	return mapErrorToType(subscriptionErrorMap, error);
}

export function getSyncErrorType(error: Error): ErrorType {
	return mapErrorToType(syncErrorMap, error);
}

/**
 * Categorizes an error with a broad error type, intended to make
 * customer error handling code simpler.
 * @param errorMap Error names and a list of patterns that indicate them (each pattern as a regex or function)
 * @param error The underying error to categorize.
 */
export function mapErrorToType(errorMap: ErrorMap, error: Error): ErrorType {
	const errorTypes = [...Object.keys(errorMap)] as ErrorType[];
	for (const errorType of errorTypes) {
		const matcher = errorMap[errorType];
		if (matcher?.(error)) {
			return errorType;
		}
	}
	return 'Unknown';
}
