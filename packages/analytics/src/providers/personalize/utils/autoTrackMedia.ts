// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isBrowser } from '@aws-amplify/core/internals/utils';
import { ConsoleLogger } from '@aws-amplify/core';

import { EventBuffer } from '../../../utils';
import { PersonalizeBufferEvent, PersonalizeEvent } from '../types';

enum HTML5_MEDIA_EVENT {
	'PLAY' = 'play',
	'PAUSE' = 'pause',
	'ENDED' = 'Ended',
}

enum MEDIA_TYPE {
	'IFRAME' = 'IFRAME',
	'VIDEO' = 'VIDEO',
	'AUDIO' = 'AUDIO',
}

enum EVENT_TYPE {
	'PLAY' = 'Play',
	'ENDED' = 'Ended',
	'PAUSE' = 'Pause',
	'TIME_WATCHED' = 'TimeWatched',
}

type IRecordEvent = (
	eventType: string,
	properties: Record<string, unknown>,
) => void;

interface MediaAutoTrackConfig {
	trackingId: string;
	sessionId: string;
	userId?: string;
	event: PersonalizeEvent;
}

const logger = new ConsoleLogger('MediaAutoTrack');

const startIframeAutoTracking = (
	element: HTMLElement,
	recordEvent: IRecordEvent,
) => {
	let isPlaying = false;
	let player: any;
	const mediaProperties = (): Record<string, unknown> => {
		const duration = Number(parseFloat(player.getDuration()).toFixed(4));
		const currentTime = Number(parseFloat(player.getCurrentTime()).toFixed(4));

		return {
			duration,
			eventValue: Number((currentTime / duration).toFixed(4)),
		};
	};

	const scriptElement = document.createElement('script');
	scriptElement.type = 'text/javascript';
	scriptElement.src = 'https://www.youtube.com/iframe_api';
	document.body.append(scriptElement);

	const timer = setInterval(() => {
		if (isPlaying && player) {
			recordEvent(EVENT_TYPE.TIME_WATCHED, mediaProperties());
		}
	}, 3_000);

	element.addEventListener('unload', () => {
		clearInterval(timer);
	});

	(window as any).onYouTubeIframeAPIReady = () => {
		delete (window as any).onYouTubeIframeAPIReady;

		player = new (window as any).YT.Player(element.id, {
			events: {
				onStateChange: (event: any) => {
					const iframeEventMapping: Record<number, EVENT_TYPE> = {
						0: EVENT_TYPE.ENDED,
						1: EVENT_TYPE.PLAY,
						2: EVENT_TYPE.PAUSE,
					};

					const eventType = iframeEventMapping[event.data];
					switch (eventType) {
						case EVENT_TYPE.ENDED:
						case EVENT_TYPE.PAUSE:
							isPlaying = false;
							break;
						case EVENT_TYPE.PLAY:
							isPlaying = true;
							break;
					}

					if (eventType) {
						recordEvent(eventType, mediaProperties());
					}
				},
			},
		});
	};
};

const startHTMLMediaAutoTracking = (
	element: HTMLMediaElement,
	recordEvent: IRecordEvent,
) => {
	let isPlaying = false;
	const mediaProperties = (): Record<string, unknown> => ({
		duration: element.duration,
		eventValue: Number((element.currentTime / element.duration).toFixed(4)),
	});

	const timer = setInterval(() => {
		if (isPlaying) {
			recordEvent(EVENT_TYPE.TIME_WATCHED, mediaProperties());
		}
	}, 3_000);

	element.addEventListener('unload', () => {
		clearInterval(timer);
	});

	element.addEventListener(HTML5_MEDIA_EVENT.PLAY, () => {
		isPlaying = true;
		recordEvent(EVENT_TYPE.PLAY, mediaProperties());
	});

	element.addEventListener(HTML5_MEDIA_EVENT.PAUSE, () => {
		isPlaying = false;
		recordEvent(EVENT_TYPE.PAUSE, mediaProperties());
	});

	element.addEventListener(HTML5_MEDIA_EVENT.ENDED, () => {
		isPlaying = false;
		recordEvent(EVENT_TYPE.ENDED, mediaProperties());
	});
};

const checkElementLoaded = (interval: number, maxTries: number) => {
	let retryCount = 0;
	const wait = () => new Promise(resolve => setTimeout(resolve, interval));
	const check = async (elementId: string): Promise<boolean> => {
		if (retryCount >= maxTries) {
			return false;
		}

		const domElement = document.getElementById(elementId);
		if (domElement && domElement.clientHeight) {
			return true;
		} else {
			retryCount += 1;
			await wait();

			return check(elementId);
		}
	};

	return check;
};

const recordEvent =
	(
		config: MediaAutoTrackConfig,
		eventBuffer: EventBuffer<PersonalizeBufferEvent>,
	): IRecordEvent =>
	(eventType: string, properties: Record<string, unknown>) => {
		// override eventType and merge properties
		eventBuffer.append({
			...config,
			event: {
				...config.event,
				eventType,
				properties: {
					...config.event.properties,
					...properties,
				},
			},
			timestamp: Date.now(),
		});
	};

export const autoTrackMedia = async (
	config: MediaAutoTrackConfig,
	eventBuffer: EventBuffer<PersonalizeBufferEvent>,
) => {
	const { eventType, properties } = config.event;
	const { domElementId, ...otherProperties } = properties;
	if (!isBrowser()) {
		logger.debug(`${eventType} only for browser`);

		return;
	}

	if (typeof domElementId === 'string' && !domElementId) {
		logger.debug(
			"Missing domElementId field in 'properties' for MediaAutoTrack event type.",
		);

		return;
	}

	const elementId = domElementId as string;
	const isElementLoaded = await checkElementLoaded(500, 5)(elementId);
	if (isElementLoaded) {
		const autoTrackConfigWithoutDomElementId = {
			...config,
			event: {
				...config.event,
				properties: otherProperties,
			},
		};

		const element = document.getElementById(elementId);
		switch (element?.tagName) {
			case MEDIA_TYPE.IFRAME:
				startIframeAutoTracking(
					element,
					recordEvent(autoTrackConfigWithoutDomElementId, eventBuffer),
				);
				break;
			case MEDIA_TYPE.VIDEO:
			case MEDIA_TYPE.AUDIO:
				if (element instanceof HTMLMediaElement) {
					startHTMLMediaAutoTracking(
						element,
						recordEvent(autoTrackConfigWithoutDomElementId, eventBuffer),
					);
				}
				break;
			default:
				logger.debug(`Unsupported DOM element tag: ${element?.tagName}`);
				break;
		}
	} else {
		logger.debug('Cannot find the media element.');
	}
};
