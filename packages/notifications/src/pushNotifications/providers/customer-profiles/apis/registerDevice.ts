// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { PlatformNotSupportedError } from '@aws-amplify/core/internals/utils';

import { RegisterDeviceInput } from '../types';

/**
 * Registers a push device with Amazon Connect Customer Profiles.
 *
 * @throws platform: {@link PlatformNotSupportedError} - Thrown if called against
 *  an unsupported platform. Currently, only React Native is supported by this
 *  API.
 */
export async function registerDevice(input: RegisterDeviceInput): Promise<void>;
/**
 * @param ctx - The {@link AmplifyContext} to use for config and credentials.
 */
export async function registerDevice(
	ctx: AmplifyContext,
	input: RegisterDeviceInput,
): Promise<void>;
export async function registerDevice(..._args: any[]): Promise<void> {
	throw new PlatformNotSupportedError();
}
