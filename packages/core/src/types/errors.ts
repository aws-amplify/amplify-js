// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type ErrorParams = {
	message: string;
	name: string;
	recoverySuggestion?: string;
	underlyingError?: Error | unknown;
};

export type AmplifyErrorMap<ErrorCode extends string> = {
	[name in ErrorCode]: {
		message: string;
		recoverySuggestion?: string;
	};
};

export type ServiceError = {
	name: string;
	message: string;
};
