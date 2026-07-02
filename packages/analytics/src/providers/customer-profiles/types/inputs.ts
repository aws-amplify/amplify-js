// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsIdentifyUserInput } from '../../../types';

import { IdentifyUserOptions } from './options';

/**
 * Input type for the Amazon Connect Customer Profiles `identifyUser` API.
 *
 * Reuses the public {@link AnalyticsIdentifyUserInput} shape (and therefore the
 * shared `UserProfile` type) so the public signature is identical to the other
 * Analytics providers.
 */
export type IdentifyUserInput = AnalyticsIdentifyUserInput<IdentifyUserOptions>;
