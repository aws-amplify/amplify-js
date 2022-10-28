// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
export const isStrictObject = obj => {
	return (
		obj instanceof Object &&
		!(obj instanceof Array) &&
		!(obj instanceof Function) &&
		!(obj instanceof Number) &&
		!(obj instanceof String) &&
		!(obj instanceof Boolean)
	);
};
