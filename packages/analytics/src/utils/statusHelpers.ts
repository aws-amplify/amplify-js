// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

let analyticsEnabled = true;

export const enableAnalytics = () => {
	analyticsEnabled = true;
};

export const disableAnalytics = () => {
	analyticsEnabled = false;
};

/**
 * Returns the current status of the Analytics category.
 */
export const isAnalyticsEnabled = () => analyticsEnabled;
