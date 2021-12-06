import { MapStyle, GeofenceOptions, Geofence } from './Geo';

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

export type AmazonLocationServiceGeofence = Geofence & {
	status: AmazonLocationServiceGeofenceStatus;
};
