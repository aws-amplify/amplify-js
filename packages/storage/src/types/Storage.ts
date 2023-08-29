// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Storage instance options
 */

import { ICredentials } from '@aws-amplify/core';

export interface StorageOptions {
	credentials?: ICredentials;
	region?: string;
	level?: StorageAccessLevel;
	bucket?: string;
	provider?: string;
	/**
	 * Custom mapping of your prefixes.
	 * For example, customPrefix: { public: 'myPublicPrefix' } will make public level operations access 'myPublicPrefix/'
	 * instead of the default 'public/'.
	 */
	customPrefix?: CustomPrefix;
	/**
	 * if set to true, automatically sends Storage Events to Amazon Pinpoint
	 **/
	track?: boolean;
	dangerouslyConnectToHttpEndpointForTesting?: boolean;
}

export type StorageAccessLevel = 'public' | 'protected' | 'private';

export type CustomPrefix = {
	[key in StorageAccessLevel]?: string;
};
