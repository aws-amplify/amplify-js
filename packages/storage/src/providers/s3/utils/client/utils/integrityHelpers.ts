// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const isNil = <T>(value?: T) => {
	return value === undefined || value === null;
};

export const bothNilOrEqual = (original?: string, output?: string): boolean => {
	return (isNil(original) && isNil(output)) || original === output;
};
