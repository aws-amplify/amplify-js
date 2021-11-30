import {
	MapStyle,
	GeofenceOptions,
	Geofence,
	GeofenceBase,
	GeofenceError,
	CreateUpdateGeofenceResults,
} from './Geo';

// Maps
export interface AmazonLocationServiceMapStyle extends MapStyle {
	region: string;
}

// Geofences
export type AmazonLocationServiceGeofenceOptions = GeofenceOptions & {
	collectionName?: string;
};

type AmazonLocationServiceError = GeofenceError & {
	error: {
		code: string;
		message: string;
	};
	geofenceId: string;
};

// Status types for Geofences
export type AmazonLocationServiceGeofenceStatus =
	| 'ACTIVE'
	| 'PENDING'
	| 'FAILED'
	| 'DELETED'
	| 'DELETING';

export type AmazonLocationServiceGeofence = Geofence & {
	status: AmazonLocationServiceGeofenceStatus;
};

export type AmazonLocationServiceCreateUpdateGeofenceResults =
	CreateUpdateGeofenceResults & {
		successes: GeofenceBase[];
		errors: AmazonLocationServiceError[];
	};
