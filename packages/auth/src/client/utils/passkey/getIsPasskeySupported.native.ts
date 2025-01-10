// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// import { PlatformNotSupportedError } from '@aws-amplify/core/internals/utils';

import { getIsPasskeySupported as rtnGetIsPasskeySupported } from '@aws-amplify/react-native';

import { PasskeyError, PasskeyErrorCode } from './errors';

/**
 * Checks if passkey authentication is supported on the current device
 * For Android: Checks if the device has the necessary hardware and software support
 * @returns Promise<boolean>
 * @throws PasskeyError if the check fails
 */
// export const getIsPasskeySupported = () => rtnGetIsPasskeySupported();
export const getIsPasskeySupported = async (): Promise<boolean> => {
	try {
		return await rtnGetIsPasskeySupported();
	} catch (error) {
		// If there's an error checking support, we treat it as not supported.
		throw new PasskeyError({
			name: PasskeyErrorCode.PasskeyNotSupported,
			message: 'Failed to determine passkey support status',
			recoverySuggestion:
				'Ensure your device is running a supported version of Android',
			underlyingError: error,
		});
	}
};
