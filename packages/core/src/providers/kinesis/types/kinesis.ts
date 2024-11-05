// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface KinesisProviderConfig {
	Kinesis: {
		region: string;
		bufferSize?: number;
		flushSize?: number;
		flushInterval?: number;
		resendLimit?: number;
	};
}
