// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { enableAnalytics } from '../utils';

/**
 * Enables the Analytics category to permit the transmission of events.
 *
 * @note
 * Analytics is enabled by default. You do not need to call this API unless you have disabled Analytics.
 */
export const enable = enableAnalytics;
