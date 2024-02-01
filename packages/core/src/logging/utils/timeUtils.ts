// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const getTimestamp = () => {
	// todo(ashwinkumar6): verify format
	// example: '35:04.630'
	const dt = new Date();
	return (
		[padding(dt.getMinutes()), padding(dt.getSeconds())].join(':') +
		'.' +
		dt.getMilliseconds()
	);
};

const padding = (n: number) => {
	return n < 10 ? '0' + n : '' + n;
};
