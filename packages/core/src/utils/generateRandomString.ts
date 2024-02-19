// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const generateRandomString = (length: number) => {
	const STATE_CHARSET =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';

	for (let i = 0; i < length; i++) {
		result += STATE_CHARSET.charAt(
			Math.floor(Math.random() * STATE_CHARSET.length),
		);
	}

	return result;
};
