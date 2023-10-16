// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { base64Encoder } from '@aws-amplify/core/internals/utils';
import { getRandomBytes } from './getRandomBytes';

/**
 * Helper function to generate a random string
 * @returns {string} a random value.
 *
 * @internal
 */
export const getRandomString = (): string =>
	base64Encoder.convert(getRandomBytes(40));
