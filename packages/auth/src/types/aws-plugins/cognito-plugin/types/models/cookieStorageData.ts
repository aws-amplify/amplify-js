// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type CookieStorageData = {
	domain: string;
	path?: string;
	expires?: number;
	secure?: boolean;
	sameSite?: 'string' | 'lax' | 'none';
}
