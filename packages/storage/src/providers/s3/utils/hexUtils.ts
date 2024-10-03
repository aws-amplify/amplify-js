// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const hexToArrayBuffer = (hexString: string) =>
	new Uint8Array((hexString.match(/\w{2}/g)! ?? []).map(h => parseInt(h, 16)))
		.buffer;

export const hexToBase64 = (hexString: string) =>
	btoa(
		hexString
			.match(/\w{2}/g)!
			.map((a: string) => String.fromCharCode(parseInt(a, 16)))
			.join(''),
	);
