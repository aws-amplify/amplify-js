// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { disableAnalytics } from '../utils';

/**
 * Disables the Analytics category.
 *
 * @note
 * When Analytics is disabled events will not be buffered or transmitted to your selected service. Any auto-tracking
 * behavior that you have configured via `configureAutoTrack` will not have any effect while Analytics is disabled.
 */
export const disable = disableAnalytics;
