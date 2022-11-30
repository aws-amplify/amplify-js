// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export function missingConfig(name: string) {
	return new Error('Missing config value of ' + name);
}
export function invalidParameter(name: string) {
	return new Error('Invalid parameter value of ' + name);
}
