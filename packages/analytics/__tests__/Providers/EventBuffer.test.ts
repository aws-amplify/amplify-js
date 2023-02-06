// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import EventBuffer from '../../src/Providers/EventBuffer';

const DEFAULT_CONFIG = {
	bufferSize: 1000,
	flushSize: 100,
	flushInterval: 5 * 1000, // 5s
	resendLimit: 5,
};

const EVENT_OBJECT = {
	params: {
		event: {
			eventId: 'event-id',
			name: 'name',
			attributes: 'attributes',
			metrics: 'metrics',
			session: {},
			immediate: false,
		},
		timestamp: '2022-06-22T17:24:58Z',
		config: {
			appId: 'app-id',
			endpointId: 'endpoint-id',
			region: 'region',
			resendLimit: 5,
		},
		credentials: {},
		resendLimit: 5,
	},
	handlers: {
		resolve: jest.fn(),
		reject: jest.fn(),
	},
};

describe('EventBuffer', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('can be constructed', () => {
		const buffer = new EventBuffer({}, DEFAULT_CONFIG);
		expect(buffer).toBeDefined();
	});

	test('does not allow buffer size to be exceeded', () => {
		const config = { ...DEFAULT_CONFIG, bufferSize: 1 };
		const buffer = new EventBuffer({}, config);
		buffer.push(EVENT_OBJECT);
		buffer.push(EVENT_OBJECT);
		expect(EVENT_OBJECT.handlers.reject).toBeCalledWith(
			Error('Exceeded the size of analytics events buffer')
		);
	});
});
