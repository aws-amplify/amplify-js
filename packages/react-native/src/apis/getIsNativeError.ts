// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

interface NativeError extends Error {
	code: string;
	domain?: string;
	userInfo?: Record<string, unknown>;
	nativeStackIOS?: never[];
	nativeStackAndroid?: Record<string, unknown>[];
}

export const getIsNativeError = (err: unknown): err is NativeError => {
	return (
		err instanceof Error &&
		'code' in err &&
		('nativeStackIOS' in err || 'nativeStackAndroid' in err)
	);
};
