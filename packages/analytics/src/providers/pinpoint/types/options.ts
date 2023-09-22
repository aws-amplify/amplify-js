// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PinpointServiceOptions } from '@aws-amplify/core/internals/providers/pinpoint';

/**
 * Options specific to Pinpoint identityUser.
 */
export type IdentifyUserOptions = Pick<
	PinpointServiceOptions,
	'userAttributes'
>;
