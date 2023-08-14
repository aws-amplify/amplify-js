// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Observable, Observer } from 'rxjs';
import { ConsoleLogger as Logger } from './Logger';

const logger = new Logger('Hub');

const AMPLIFY_SYMBOL = (
	typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
		? Symbol.for('amplify_default')
		: '@@amplify_default'
) as Symbol;
interface IPattern {
	pattern: RegExp;
	callback: HubCallback;
}

interface IListener {
	name: string;
	callback: HubCallback;
}

export type HubCapsule = {
	channel: string;
	payload: HubPayload;
	source: string;
	patternInfo?: string[];
};

export type HubPayload = {
	event: string;
	data?: any;
	message?: string;
};

export type HubCallback = (capsule: HubCapsule) => void;

export type LegacyCallback = { onHubCapsule: HubCallback };

export class HubClass {
	name: string;
	private observers: Record<string, Set<Observer<HubCapsule>>> = {};
	protectedChannels = [
		'core',
		'auth',
		'api',
		'analytics',
		'interactions',
		'pubsub',
		'storage',
		'ui',
		'xr',
	];

	constructor(name: string) {
		this.name = name;
	}

	/**
	 * Used to send a Hub event.
	 *
	 * @param channel - The channel on which the event will be broadcast
	 * @param payload - The HubPayload
	 * @param source  - The source of the event; defaults to ''
	 * @param ampSymbol - Symbol used to determine if the event is dispatched internally on a protected channel
	 *
	 */
	dispatch(
		channel: string,
		payload: HubPayload,
		source: string = '',
		ampSymbol?: Symbol
	) {
		if (this.protectedChannels.indexOf(channel) > -1) {
			const hasAccess = ampSymbol === AMPLIFY_SYMBOL;

			if (!hasAccess) {
				logger.warn(
					`WARNING: ${channel} is protected and dispatching on it can have unintended consequences`
				);
			}
		}

		const capsule: HubCapsule = {
			channel,
			payload: { ...payload },
			source,
			patternInfo: [],
		};

		try {
			this._toListeners(capsule);
		} catch (e) {
			logger.error(e);
		}
	}

	/**
	 * Used to listen for Hub events.
	 *
	 * @param channel - The channel on which to listen
	 * @returns An Observable to subscribe to the events.
	 *
	 */
	listen(channel: string): Observable<HubCapsule> {
		return new Observable(observer => {
			// One record per channel that contains a Set of Observer
			if (this.observers[channel] === undefined) {
				this.observers[channel] = new Set<Observer<HubCapsule>>();
			}

			this.observers[channel].add(observer);
			return () => {
				this.observers[channel].delete(observer);
			};
		});
	}

	private _toListeners(capsule: HubCapsule) {
		if (this.observers[capsule.channel] !== undefined) {
			this.observers[capsule.channel].forEach(observer => {
				observer.next(capsule);
			});
		}
	}
}

/*We export a __default__ instance of HubClass to use it as a 
pseudo Singleton for the main messaging bus, however you can still create
your own instance of HubClass() for a separate "private bus" of events.*/
export const Hub = new HubClass('__default__');
