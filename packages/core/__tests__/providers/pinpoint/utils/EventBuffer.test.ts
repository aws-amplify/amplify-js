// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { PinpointEventBuffer } from '../../../../src/providers/pinpoint/utils/PinpointEventBuffer';

const DEFAULT_CONFIG = {
	appId: 'app-id',
	credentials: {
		accessKeyId: 'access-key-id',
		secretAccessKey: 'secret-access-key'
	},
	identityId: 'identity-id',
	bufferSize: 1000,
	flushSize: 100,
	flushInterval: 5 * 1000, // 5s
	resendLimit: 5,
	region: 'region'
};

const EVENT_OBJECT = {
	endpointId: 'endpoint-id',
	eventId: 'event-id',
	event: {
		name: 'name',
		attributes: {},
		metrics: {},
	},
	timestamp: '2022-06-22T17:24:58Z',
	config: {
		appId: 'app-id',
		endpointId: 'endpoint-id',
		region: 'region',
		resendLimit: 5,
	},
	credentials: {},
	session: {
		Id: 'session-id',
		StartTimestamp: 'start-timestamp'
	},
	resendLimit: 5,
};

describe('EventBuffer', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('can be constructed', () => {
		const buffer = new PinpointEventBuffer(DEFAULT_CONFIG);
		expect(buffer).toBeDefined();
	});

	test('does not allow buffer size to be exceeded', () => {
		const config = { ...DEFAULT_CONFIG, bufferSize: 1 };
		const buffer = new PinpointEventBuffer(config);
		buffer.push(EVENT_OBJECT);
		buffer.push(EVENT_OBJECT);
	});
});
