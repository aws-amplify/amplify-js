// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface GeoConfig {
	region?: string;
	AmazonLocationService?: {
		maps?: {
			items: {};
			default: string;
		};
		search_indices?: {
			items: string[];
			default: string;
		};
		geofenceCollections?: {
			items: string[];
			default: string;
		};
	};
}
