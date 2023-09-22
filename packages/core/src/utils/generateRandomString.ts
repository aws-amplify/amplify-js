// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const generateRandomString = () => {
	let result = '';
	const chars =
		'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	for (let i = 32; i > 0; i -= 1) {
		result += chars[Math.floor(Math.random() * chars.length)];
	}
	return result;
};
