// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const DEFAULT_KINESIS_FIREHOSE_CONFIG = {
	bufferSize: 1_000,
	flushSize: 100,
	flushInterval: 5_000,
	resendLimit: 5,
};
