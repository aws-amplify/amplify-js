// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	MapStyle,
	GeofenceOptions,
	ListGeofenceOptions,
	Geofence,
	DeleteGeofencesResults,
	GeofenceError,
} from './Geo';

// Maps
/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface AmazonLocationServiceMapStyle extends MapStyle {
	region: string;
}

// Geofences
/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type AmazonLocationServiceGeofenceOptions = GeofenceOptions & {
	collectionName?: string;
};

// Status types for Geofences
/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type AmazonLocationServiceGeofenceStatus =
	| 'ACTIVE'
	| 'PENDING'
	| 'FAILED'
	| 'DELETED'
	| 'DELETING';

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type AmazonLocationServiceGeofence = Omit<Geofence, 'status'> & {
	status: AmazonLocationServiceGeofenceStatus;
};

// List Geofences
/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type AmazonLocationServiceListGeofenceOptions = ListGeofenceOptions & {
	collectionName?: string;
};

// Delete Geofences
/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type AmazonLocationServiceBatchGeofenceErrorMessages =
	| 'AccessDeniedException'
	| 'InternalServerException'
	| 'ResourceNotFoundException'
	| 'ThrottlingException'
	| 'ValidationException';

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type AmazonLocationServiceBatchGeofenceError = Omit<
	GeofenceError,
	'error'
> & {
	error: {
		code: string;
		message: AmazonLocationServiceBatchGeofenceErrorMessages;
	};
};

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type AmazonLocationServiceDeleteGeofencesResults = Omit<
	DeleteGeofencesResults,
	'errors'
> & {
	errors: AmazonLocationServiceBatchGeofenceError[];
};
