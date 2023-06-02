// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserInfo } from '../../types';

export interface AWSPinpointProviderConfig {
	appId: string;
	region: string;
}

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
