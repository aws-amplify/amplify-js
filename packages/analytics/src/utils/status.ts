// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

let AnalyticsEnabled = true;

export const enableAnalytics = () => (AnalyticsEnabled = true);

export const disableAnalytics = () => (AnalyticsEnabled = false);

/**
 * Returns the current status of the Analytics category.
 */
export const isAnalyticsEnabled = () => AnalyticsEnabled;
