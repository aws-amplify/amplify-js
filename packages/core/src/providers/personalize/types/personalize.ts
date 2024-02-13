// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface PersonalizeProviderConfig {
	Personalize: {
		trackingId: string;
		region: string;
		flushSize?: number;
		flushInterval?: number;
	};
}
