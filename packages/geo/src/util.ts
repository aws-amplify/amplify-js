/*
 * Copyright 2017-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import { Coordinates, Longitude, Latitude } from './types';

export function validateCoordinates(lng: Longitude, lat: Latitude): boolean {
	if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
		throw new Error(`Invalid coordinates: [${lng},${lat}]`);
	}
	if (lat < -90 || lat > 90) {
		throw new Error('Latitude must be between -90 and 90 degrees inclusive.');
	} else if (lng < -180 || lng > 180) {
		throw new Error(
			'Longitude must be between -180 and 180 degrees inclusive.'
		);
	}
	return true;
}
