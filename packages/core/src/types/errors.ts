// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export enum AmplifyErrorCode {
	NoEndpointId = 'NoEndpointId',
	PlatformNotSupported = 'PlatformNotSupported',
	Unknown = 'Unknown',
}

export interface AmplifyErrorParams<ErrorCode extends string = string> {
	message: string;
	name: ErrorCode;
	recoverySuggestion?: string;
	underlyingError?: Error | unknown;
}

export type AmplifyErrorMap<ErrorCode extends string = string> = {
	[name in ErrorCode]: {
		message: string;
		recoverySuggestion?: string;
	};
};

export interface ServiceError {
	name: string;
	message: string;
}

export type AssertionFunction<ErrorCode extends string = string> = (
	assertion: boolean,
	name: ErrorCode,
	additionalContext?: string,
) => asserts assertion;
