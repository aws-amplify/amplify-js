// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorCode } from '../types';

import { AmplifyError } from './AmplifyError';

export class PlatformNotSupportedError extends AmplifyError {
	constructor() {
		super({
			name: AmplifyErrorCode.PlatformNotSupported,
			message: 'Function not supported on current platform',
		});
	}
}
