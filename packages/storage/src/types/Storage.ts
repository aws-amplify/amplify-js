// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
export type StorageOperationConfigMap<
	Default,
	T extends Record<string, any>
> = T extends { provider: string }
	? T extends { provider: 'AWSS3' }
		? Default
		: T & { provider: string }
	: Default;
