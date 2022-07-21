/*
 * Copyright 2017-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
