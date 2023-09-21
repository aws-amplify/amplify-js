// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface GeoConfig {
	LocationService?: {
		region: string;
		maps?: {
			items: {};
			default: string;
		};
		searchIndices?: {
			items: string[];
			default: string;
		};
		geofenceCollections?: {
			items: string[];
			default: string;
		};
	};
}
