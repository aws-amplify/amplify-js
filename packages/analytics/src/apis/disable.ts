// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { disableAnalytics } from '../utils';

/**
 * Disables the Analytics category.
 *
 * {@link https://docs.amplify.aws/gen1/react/build-a-backend/more-features/analytics/enable-disable/#disable-analytics}
 * @note
 * When Analytics is disabled events will not be buffered or transmitted to your selected service. Any auto-tracking
 * behavior that you have configured via `configureAutoTrack` will not have any effect while Analytics is disabled.
 */
export const disable = disableAnalytics;
