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
export interface AmazonLocationServiceMapStyle extends MapStyle {
	region: string;
}

// Geofences
export type AmazonLocationServiceGeofenceOptions = GeofenceOptions & {
	collectionName?: string;
};

// Status types for Geofences
export type AmazonLocationServiceGeofenceStatus =
	| 'ACTIVE'
	| 'PENDING'
	| 'FAILED'
	| 'DELETED'
	| 'DELETING';

export type AmazonLocationServiceGeofence = Omit<Geofence, 'status'> & {
	status: AmazonLocationServiceGeofenceStatus;
};

// List Geofences
export type AmazonLocationServiceListGeofenceOptions = ListGeofenceOptions & {
	collectionName?: string;
};

// Delete Geofences
export type AmazonLocationServiceBatchGeofenceErrorMessages =
	| 'AccessDeniedException'
	| 'InternalServerException'
	| 'ResourceNotFoundException'
	| 'ThrottlingException'
	| 'ValidationException';

export type AmazonLocationServiceBatchGeofenceError = Omit<
	GeofenceError,
	'error'
> & {
	error: {
		code: string;
		message: AmazonLocationServiceBatchGeofenceErrorMessages;
	};
};

export type AmazonLocationServiceDeleteGeofencesResults = Omit<
	DeleteGeofencesResults,
	'errors'
> & {
	errors: AmazonLocationServiceBatchGeofenceError[];
};
