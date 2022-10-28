// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	public async deleteGeofences(
		geofenceIds: string | string[],
		options?: GeofenceOptions
	): Promise<DeleteGeofencesResults> {
		const { providerName = DEFAULT_PROVIDER } = options || {};
		const prov = this.getPluggable(providerName);

		// If single geofence input, make it an array for batch call
		let geofenceIdsInputArray;
		if (!Array.isArray(geofenceIds)) {
			geofenceIdsInputArray = [geofenceIds];
		} else {
			geofenceIdsInputArray = geofenceIds;
		}

		//  Delete geofences
		try {
			return await prov.deleteGeofences(geofenceIdsInputArray, options);
		} catch (error) {
			logger.debug(error);
			throw error;
		}
	}
}

export const Geo = new GeoClass();
Amplify.register(Geo);
