// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const getTimestamp = () => {
	const dt = new Date();
	// todo(ashwinkumar6): verify format
	return (
		[padding(dt.getMinutes()), padding(dt.getSeconds())].join(':') +
		'.' +
		dt.getMilliseconds()
	);
};

const padding = (n: number) => {
	return n < 10 ? '0' + n : '' + n;
};
