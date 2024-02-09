// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AtLeastOne } from '../types';

export type LocationServiceConfig = {
	LocationService: {
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
};

export type GeoConfig = AtLeastOne<LocationServiceConfig>;
