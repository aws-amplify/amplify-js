// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export function getRegion(userPoolId?: string): string {
	return userPoolId?.split('_')[0] || '';
}
