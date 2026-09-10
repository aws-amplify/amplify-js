// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserInfo } from '../../types';

/**
 * @deprecated AWS will end support for Amazon Pinpoint on October 30, 2026.
 */
export interface AWSPinpointProviderConfig {
	appId: string;
	region: string;
}

/**
 * @deprecated AWS will end support for Amazon Pinpoint on October 30, 2026.
 * Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface AWSPinpointUserInfo extends UserInfo {
	address?: string;
	optOut?: 'ALL' | 'NONE';
}

export type ChannelType =
	| 'ADM'
	| 'APNS'
	| 'APNS_SANDBOX'
	| 'APNS_VOIP'
	| 'APNS_VOIP_SANDBOX'
	| 'BAIDU'
	| 'CUSTOM'
	| 'EMAIL'
	| 'GCM'
	| 'IN_APP'
	| 'PUSH'
	| 'SMS'
	| 'VOICE';
