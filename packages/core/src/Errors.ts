// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ErrorParams } from './types';

export function missingConfig(name: string) {
	return new Error('Missing config value of ' + name);
}
export function invalidParameter(name: string) {
	return new Error('Invalid parameter value of ' + name);
}

export enum AmplifyErrorString {
	UNKNOWN = 'UnknownError',
	PLATFORM_NOT_SUPPORTED_ERROR = 'PlatformNotSupportedError',
}
export class AmplifyError extends Error {
	underlyingError?: Error | unknown;
	recoverySuggestion?: string;
	/**
	 *  Constructs an AmplifyError.
	 *
	 * @param message text that describes the main problem.
	 * @param underlyingError the underlying cause of the error.
	 * @param recoverySuggestion suggestion to recover from the error.
	 *
	 */
	constructor({
		message,
		name,
		recoverySuggestion,
		underlyingError,
	}: ErrorParams) {
		super(message);

		this.name = name;
		this.underlyingError = underlyingError;
		this.recoverySuggestion = recoverySuggestion;

		// Hack for making the custom error class work when transpiled to es5
		// TODO: Delete the following 2 lines after we change the build target to >= es2015
		this.constructor = AmplifyError;
		Object.setPrototypeOf(this, AmplifyError.prototype);
	}
}

export const PlatformNotSupportedError = new AmplifyError({
	name: AmplifyErrorString.PLATFORM_NOT_SUPPORTED_ERROR,
	message: 'Function not supported on current platform',
});
