// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Arbitrary key/value pairs that may be passed as part of certain Cognito requests
 */
export type ClientMetadata = {
	[key: string]: string;
};
