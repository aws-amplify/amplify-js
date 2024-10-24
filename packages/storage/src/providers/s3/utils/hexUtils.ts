// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { toBase64 } from './client/runtime';

export const hexToUint8Array = (hexString: string) =>
	new Uint8Array((hexString.match(/\w{2}/g)! ?? []).map(h => parseInt(h, 16)));

export const hexToArrayBuffer = (hexString: string) =>
	hexToUint8Array(hexString).buffer;

export const hexToBase64 = (hexString: string) =>
	toBase64(hexToUint8Array(hexString));
