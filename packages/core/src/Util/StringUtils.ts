// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export function urlSafeEncode(str: string) {
	return str
		.split('')
		.map(char =>
			char
				.charCodeAt(0)
				.toString(16)
				.padStart(2, '0')
		)
		.join('');
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export function urlSafeDecode(hex: string) {
	return hex
		.match(/.{2}/g)
		.map(char => String.fromCharCode(parseInt(char, 16)))
		.join('');
}
