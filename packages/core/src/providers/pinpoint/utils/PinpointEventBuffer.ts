// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '../../../Logger';
import {
	EventsBatch,
	putEvents,
	PutEventsInput,
	PutEventsOutput,
} from '../../../awsClients/pinpoint';
import {
	PinpointEventBufferConfig,
	BufferedEvent,
	BufferedEventMap,
	EventBuffer,
} from '../types/buffer';
import { AuthSession } from '../../../singleton/Auth/types';
import { isAppInForeground } from './isAppInForeground';

const logger = new ConsoleLogger('PinpointEventBuffer');
const RETRYABLE_CODES = [429, 500];
const ACCEPTED_CODES = [202];

export class PinpointEventBuffer {
	private _config: PinpointEventBufferConfig;
	private _interval: ReturnType<typeof setInterval> | undefined = undefined;
	private _buffer: EventBuffer;
	private _pause = false;
	private _flush = false;

	constructor(config: PinpointEventBufferConfig) {
		this._buffer = [];
		this._config = config;

		this._sendBatch = this._sendBatch.bind(this);

		this._startLoop();
	}

	public push(event: BufferedEvent) {
		if (this._buffer.length >= this._config.bufferSize) {
			logger.debug('Exceeded Pinpoint event buffer limits, event dropped.', {
				eventId: event.eventId,
			});

			return;
		}

		this._buffer.push({ [event.eventId]: event });
	}

	public pause() {
		this._pause = true;
	}

	public resume() {
		this._pause = false;
	}

	public flush() {
		this._flush = true;
	}

	public identityHasChanged(identityId: AuthSession['identityId']) {
		return this._config.identityId !== identityId;
	}

	public flushAll() {
		this._putEvents(this._buffer.splice(0, this._buffer.length));
	}

	private _startLoop() {
		if (this._interval) {
			clearInterval(this._interval);
		}

		const { flushInterval } = this._config;

		this._interval = setInterval(this._sendBatch, flushInterval);
	}

	private _sendBatch() {
		const bufferLength = this._buffer.length;

		if (this._flush && !bufferLength && this._interval) {
			clearInterval(this._interval);
		}

		if (this._pause || !bufferLength || !isAppInForeground()) {
			return;
		}

		const { flushSize } = this._config;

		const batchSize = Math.min(flushSize, bufferLength);
		const bufferSubset = this._buffer.splice(0, batchSize);

		this._putEvents(bufferSubset);
	}

	private async _putEvents(buffer: EventBuffer) {
		const eventMap: BufferedEventMap = this._bufferToMap(buffer);
		const batchEventParams = this._generateBatchEventParams(eventMap);

		try {
			const { credentials, region, userAgentValue } = this._config;
			const data: PutEventsOutput = await putEvents(
				{
					credentials,
					region,
					userAgentValue,
				},
				batchEventParams
			);
			this._processPutEventsSuccessResponse(data, eventMap);
		} catch (err) {
			return this._handlePutEventsFailure(err, eventMap);
		}
	}

	private _generateBatchEventParams(
		eventMap: BufferedEventMap
	): PutEventsInput {
		const batchItem: Record<string, EventsBatch> = {};

		Object.values(eventMap).forEach(item => {
			const { event, timestamp, endpointId, eventId, session } = item;
			const { name, attributes, metrics } = event;

			batchItem[endpointId] = {
				Endpoint: {
					...batchItem[endpointId]?.Endpoint,
				},
				Events: {
					...batchItem[endpointId]?.Events,
					[eventId]: {
						EventType: name,
						Timestamp: new Date(timestamp).toISOString(),
						Attributes: attributes,
						Metrics: metrics,
						Session: session,
					},
				},
			};
		});

		return {
			ApplicationId: this._config.appId,
			EventsRequest: {
				BatchItem: batchItem,
			},
		};
	}

	private _handlePutEventsFailure(err: any, eventMap: BufferedEventMap) {
		logger.debug('putEvents call to Pinpoint failed.', err);
		const statusCode = err.$metadata && err.$metadata.httpStatusCode;

		if (RETRYABLE_CODES.includes(statusCode)) {
			const retryableEvents = Object.values(eventMap);
			this._retry(retryableEvents);
			return;
		}
	}

	private _processPutEventsSuccessResponse(
		data: PutEventsOutput,
		eventMap: BufferedEventMap
	) {
		const { Results = {} } = data.EventsResponse ?? {};
		const retryableEvents: BufferedEvent[] = [];

		Object.entries(Results).forEach(([endpointId, endpointValues]) => {
			const responses = endpointValues.EventsItemResponse ?? {};

			Object.entries(responses).forEach(([eventId, eventValues]) => {
				const eventObject = eventMap[eventId];
				if (!eventObject) {
					return;
				}

				const { StatusCode, Message } = eventValues ?? {};

				// manually crafting handlers response to keep API consistant
				const response = {
					EventsResponse: {
						Results: {
							[endpointId]: {
								EventsItemResponse: {
									[eventId]: { StatusCode, Message },
								},
							},
						},
					},
				};

				if (StatusCode && ACCEPTED_CODES.includes(StatusCode)) {
					return;
				}

				if (StatusCode && RETRYABLE_CODES.includes(StatusCode)) {
					retryableEvents.push(eventObject);
					return;
				}

				const { name } = eventObject.event;

				logger.warn('Pinpoint event failed to send.', {
					eventId,
					name,
					message: Message,
				});
			});
		});

		if (retryableEvents.length) {
			this._retry(retryableEvents);
		}
	}

	private _retry(retryableEvents: BufferedEvent[]) {
		// retryable events that haven't reached the resendLimit
		const eligibleEvents: EventBuffer = [];

		retryableEvents.forEach((bufferedEvent: BufferedEvent) => {
			const { eventId } = bufferedEvent;
			const { name } = bufferedEvent.event;

			if (bufferedEvent!.resendLimit!-- > 0) {
				logger.debug('Resending event.', {
					eventId,
					name,
					remainingAttempts: bufferedEvent.resendLimit,
				});
				eligibleEvents.push({ [eventId!]: bufferedEvent });
				return;
			}

			logger.debug('No retry attempts remaining for event.', {
				eventId,
				name,
			});
		});

		// add the events to the front of the buffer
		this._buffer.unshift(...eligibleEvents);
	}

	private _bufferToMap(buffer: EventBuffer) {
		return buffer.reduce((acc, curVal) => {
			const [[key, value]] = Object.entries(curVal);
			acc[key] = value;
			return acc;
		}, {});
	}
}
