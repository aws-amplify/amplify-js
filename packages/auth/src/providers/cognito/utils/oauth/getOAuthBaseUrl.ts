// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/** @internal */
export function getOAuthBaseUrl(domain: string): string {
	return /^https?:\/\//.test(domain) ? domain : `https://${domain}`;
}
