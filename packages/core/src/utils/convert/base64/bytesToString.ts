// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export function bytesToString(input: Uint8Array): string {
	return Array.from(input, byte => String.fromCodePoint(byte)).join('');
}
