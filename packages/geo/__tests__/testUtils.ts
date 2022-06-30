import {
	BatchPutGeofenceCommand,
	GetGeofenceCommand,
	ListGeofencesCommand,
	BatchDeleteGeofenceCommand,
} from '@aws-sdk/client-location';

import { validPolygon, validGeometry } from './testData';

export function createGeofenceInputArray(numberOfGeofences) {
	const geofences = [];
	for (let i = 0; i < numberOfGeofences; i++) {
		geofences.push({
			geofenceId: `validGeofenceId${i}`,
			geometry: validGeometry,
		});
	}
	return geofences;
}

export function createGeofenceOutputArray(numberOfGeofences) {
	const geofences = [];
	for (let i = 0; i < numberOfGeofences; i++) {
		geofences.push({
			GeofenceId: `validGeofenceId${i}`,
			Geometry: {
				Polygon: validPolygon,
			},
			Status: 'ACTIVE',
			CreateTime: '2020-04-01T21:00:00.000Z',
			UpdateTime: '2020-04-01T21:00:00.000Z',
		});
	}
	return geofences;
}

export function mockBatchPutGeofenceCommand(command) {
	if (command instanceof BatchPutGeofenceCommand) {
		return {
			Successes: command.input.Entries.map(geofence => {
				return {
					CreateTime: '2020-04-01T21:00:00.000Z',
					UpdateTime: '2020-04-01T21:00:00.000Z',
					GeofenceId: geofence.GeofenceId,
				};
			}),
			Errors: [],
		};
	}
	if (command instanceof GetGeofenceCommand) {
		return mockGetGeofenceCommand(command);
	}
}

export function mockGetGeofenceCommand(command) {
	if (command instanceof GetGeofenceCommand) {
		return {
			GeofenceId: command.input.GeofenceId,
			Geometry: {
				Polygon: validPolygon,
			},
			CreateTime: '2020-04-01T21:00:00.000Z',
			UpdateTime: '2020-04-01T21:00:00.000Z',
			Status: 'ACTIVE',
		};
	}
}

export function mockListGeofencesCommand(command) {
	if (command instanceof ListGeofencesCommand) {
		const geofences = createGeofenceOutputArray(200);
		if (command.input.NextToken === 'THIS IS YOUR TOKEN') {
			return {
				Entries: geofences.slice(100, 200),
				NextToken: 'THIS IS YOUR SECOND TOKEN',
			};
		}
		return {
			Entries: geofences.slice(0, 100),
			NextToken: 'THIS IS YOUR TOKEN',
		};
	}
}

export function mockDeleteGeofencesCommand(command) {
	if (command instanceof BatchDeleteGeofenceCommand) {
		return {
			Errors: [],
		};
	}
}
