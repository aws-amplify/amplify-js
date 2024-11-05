// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export function urlSafeDecode(hex: string) {
	const matchArr = hex.match(/.{2}/g) || [];

	return matchArr.map(char => String.fromCharCode(parseInt(char, 16))).join('');
}
