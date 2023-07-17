// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
export interface PersonalizeAnalyticsEvent {
	eventType?: string;
	userId?: string;
	properties?: {
		[key: string]: string;
	};
}
