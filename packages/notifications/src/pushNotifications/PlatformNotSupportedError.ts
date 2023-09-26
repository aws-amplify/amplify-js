// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export default class PlatformNotSupportedError extends Error {
	constructor() {
		super('Function not supported on current platform');
		this.name = 'PlatformNotSupportedError';
	}
}
