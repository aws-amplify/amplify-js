// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export function urlSafeEncode(str: string) {
	return str
		.split('')
		.map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
		.join('');
}
