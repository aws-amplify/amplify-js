// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	private async _ensureCredentials(): Promise<boolean> {
		try {
			const credentials = await Credentials.get();
			if (!credentials) return false;
			const cred = Credentials.shear(credentials);
			logger.debug('Set credentials for storage. Credentials are:', cred);
			this._config.credentials = cred;
			return true;
		} catch (error) {
			logger.debug('Ensure credentials error. Credentials are:', error);
			return false;
		}
	}

	private _verifyMapResources() {
		if (!this._config.maps) {
			const errorString =
				"No map resources found in amplify config, run 'amplify add geo' to create one and run `amplify push` after";
			logger.debug(errorString);
			throw new Error(errorString);
		}
		if (!this._config.maps.default) {
			const errorString =
				"No default map resource found in amplify config, run 'amplify add geo' to create one and run `amplify push` after";
			logger.debug(errorString);
			throw new Error(errorString);
		}
	}

	private _verifySearchIndex(optionalSearchIndex?: string) {
		if (
			(!this._config.search_indices || !this._config.search_indices.default) &&
			!optionalSearchIndex
		) {
			const errorString =
				'No Search Index found in amplify config, please run `amplify add geo` to create one and run `amplify push` after.';
			logger.debug(errorString);
			throw new Error(errorString);
		}
	}

	private _verifyGeofenceCollections(optionalGeofenceCollectionName?: string) {
		if (
			(!this._config.geofenceCollections ||
				!this._config.geofenceCollections.default) &&
			!optionalGeofenceCollectionName
		) {
			const errorString =
				'No Geofence Collections found, please run `amplify add geo` to create one and run `amplify push` after.';
			logger.debug(errorString);
			throw new Error(errorString);
		}
	}

	private async _AmazonLocationServiceBatchPutGeofenceCall(
		PascalGeofences: BatchPutGeofenceRequestEntry[],
		collectionName?: string
	) {
		// Create the BatchPutGeofence input
		const geofenceInput: BatchPutGeofenceCommandInput = {
			Entries: PascalGeofences,
			CollectionName:
				collectionName || this._config.geofenceCollections.default,
		};

		const client = new LocationClient({
			credentials: this._config.credentials,
			region: this._config.region,
			customUserAgent: getAmplifyUserAgent(),
		});
		const command = new BatchPutGeofenceCommand(geofenceInput);

		let response: BatchPutGeofenceCommandOutput;
		try {
			response = await client.send(command);
		} catch (error) {
			throw error;
		}
		return response;
	}

	private async _AmazonLocationServiceBatchDeleteGeofenceCall(
		geofenceIds: string[],
		collectionName?: string
	): Promise<BatchDeleteGeofenceCommandOutput> {
		// Create the BatchDeleteGeofence input
		const deleteGeofencesInput: BatchDeleteGeofenceCommandInput = {
			GeofenceIds: geofenceIds,
			CollectionName:
				collectionName || this._config.geofenceCollections.default,
		};

		const client = new LocationClient({
			credentials: this._config.credentials,
			region: this._config.region,
			customUserAgent: getAmplifyUserAgent(),
		});
		const command = new BatchDeleteGeofenceCommand(deleteGeofencesInput);

		let response: BatchDeleteGeofenceCommandOutput;
		try {
			response = await client.send(command);
		} catch (error) {
			throw error;
		}
		return response;
	}
}
