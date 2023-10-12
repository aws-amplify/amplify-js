// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type InteractionsResponse = {
	[key: string]: any;
};

export type CompletionCallback = (
	error?: Error,
	completion?: InteractionsResponse
) => void;
