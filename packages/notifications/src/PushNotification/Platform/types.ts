// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface Platform {
	OS: KnownOS | 'unknown';
}

type KnownOS =
	| 'windows'
	| 'macos'
	| 'unix'
	| 'linux'
	| 'ios'
	| 'android'
	| 'web';
