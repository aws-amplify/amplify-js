// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface Base64EncoderConvertOptions {
	urlSafe: boolean;
}

export interface Base64Encoder {
	convert(
		input: Uint8Array | string,
		options?: Base64EncoderConvertOptions,
	): string;
}

export interface Base64Decoder {
	convert(input: string): string;
}
