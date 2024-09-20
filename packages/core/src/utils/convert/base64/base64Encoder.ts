// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getBtoa } from '../../globalHelpers';
import type { Base64Encoder, Base64EncoderConvertOptions } from '../types';

import { bytesToString } from './bytesToString';

export const base64Encoder: Base64Encoder = {
	/**
	 * Convert input to base64-encoded string
	 * @param input - string to convert to base64
	 * @param options - encoding options that can optionally produce a base64url string
	 * @returns base64-encoded string
	 */
	convert(
		input,
		options: Base64EncoderConvertOptions = {
			urlSafe: false,
			skipPadding: false,
		},
	) {
		const inputStr = typeof input === 'string' ? input : bytesToString(input);
		let encodedStr = getBtoa()(inputStr);

		// urlSafe char replacement and skipPadding options conform to the base64url spec
		// https://datatracker.ietf.org/doc/html/rfc4648#section-5
		if (options.urlSafe) {
			encodedStr = encodedStr.replace(/\+/g, '-').replace(/\//g, '_');
		}

		if (options.skipPadding) {
			encodedStr = encodedStr.replace(/=/g, '');
		}

		return encodedStr;
	},
};
