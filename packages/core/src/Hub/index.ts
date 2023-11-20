// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '../Logger';
import { NO_HUBCALLBACK_PROVIDED_EXCEPTION } from '../constants';
import { AmplifyError } from '../errors';
import {
	AmplifyChannel,
	AmplifyEventData,
	EventDataMap,
	HubCallback,
	HubCapsule,
	HubPayload,
	IListener,
	StopListenerCallback,
} from './types';

export const AMPLIFY_SYMBOL = (
	typeof Symbol !== 'undefined'
		? Symbol('amplify_default')
		: '@@amplify_default'
) as Symbol;

const logger = new ConsoleLogger('Hub');

export class HubClass {
	name: string;
	private listeners = new Map<string, IListener>();

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
	 * Used internally to remove a Hub listener.
	 *
	 * @remarks
	 * This private method is for internal use only. Instead of calling Hub.remove, call the result of Hub.listen.
	 */
	private _remove<
		Channel extends AmplifyChannel | string = string,
		EventData extends EventDataMap = EventDataMap,
	>(channel: Channel, listener: HubCallback<Channel, EventData>) {
		const holder = this.listeners.get(channel);
		if (!holder) {
			logger.warn(`No listeners for ${channel}`);
			return;
		}
		this.listeners.set(channel, [
			...holder.filter(({ callback }) => callback !== listener),
		]);
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

	dispatch<Channel extends AmplifyChannel>(
		channel: Channel,
		payload: HubPayload<AmplifyEventData[Channel]>,
		source?: string,
		ampSymbol?: Symbol
	): void;

	dispatch(
		channel: string,
		payload: HubPayload,
		source?: string,
		ampSymbol?: Symbol
	): void;

	dispatch<
		Channel extends AmplifyChannel | string,
		EventData extends EventDataMap = EventDataMap,
	>(
		channel: Channel | string,
		payload: HubPayload<EventData>,
		source?: string,
		ampSymbol?: Symbol
	): void {
		if (
			typeof channel === 'string' &&
			this.protectedChannels.indexOf(channel) > -1
		) {
			const hasAccess = ampSymbol === AMPLIFY_SYMBOL;

			if (!hasAccess) {
				logger.warn(
					`WARNING: ${channel} is protected and dispatching on it can have unintended consequences`
				);
			}
		}

		const capsule: HubCapsule<Channel | string, EventData> = {
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
	 * @param callback - The callback to execute when an event is received on the specified channel
	 * @param listenerName - The name of the listener; defaults to 'noname'
	 * @returns A function which can be called to cancel the listener.
	 *
	 */
	listen<
		Channel extends AmplifyChannel,
		EventData extends EventDataMap = EventDataMap,
	>(
		channel: Channel,
		callback: HubCallback<Channel, AmplifyEventData[Channel]>,
		listenerName?: string
	): StopListenerCallback;

	listen<EventData extends EventDataMap>(
		channel: string,
		callback: HubCallback<string, EventData>,
		listenerName?: string
	): StopListenerCallback;

	listen<
		Channel extends AmplifyChannel | string = string,
		EventData extends EventDataMap = EventDataMap,
	>(
		channel: Channel,
		callback: HubCallback<Channel, EventData>,
		listenerName: string = 'noname'
	): StopListenerCallback {
		let cb: HubCallback<string, EventDataMap>;
		if (typeof callback !== 'function') {
			throw new AmplifyError({
				name: NO_HUBCALLBACK_PROVIDED_EXCEPTION,
				message: 'No callback supplied to Hub',
			});
		} else {
			// Needs to be casted as a more generic type
			cb = callback as HubCallback<string, EventDataMap>;
		}
		let holder = this.listeners.get(channel);

		if (!holder) {
			holder = [];
			this.listeners.set(channel, holder);
		}

		holder.push({
			name: listenerName,
			callback: cb,
		});
		return () => {
			this._remove(channel, cb);
		};
	}

	private _toListeners<Channel extends AmplifyChannel | string>(
		capsule: HubCapsule<Channel, EventDataMap | AmplifyEventData[Channel]>
	) {
		const { channel, payload } = capsule;
		const holder = this.listeners.get(channel);
		if (holder) {
			holder.forEach(listener => {
				logger.debug(`Dispatching to ${channel} with `, payload);
				try {
					listener.callback(capsule);
				} catch (e) {
					logger.error(e);
				}
			});
		}
	}
}

/*We export a __default__ instance of HubClass to use it as a 
pseudo Singleton for the main messaging bus, however you can still create
your own instance of HubClass() for a separate "private bus" of events.*/
export const Hub = new HubClass('__default__');

/**
 * @internal
 *
 * Internal hub used for core Amplify functionality. Not intended for use outside of Amplify.
 *
 */
export const HubInternal = new HubClass('internal-hub');
