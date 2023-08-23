// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger as Logger } from '../Logger';
import {
	AmplifyChannel,
	AmplifyChannelMap,
	AmplifyEventDataMap,
	HubCallback,
	HubCapsule,
	HubPayload,
	IListener,
} from './types';

export const AMPLIFY_SYMBOL = (
	typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
		? Symbol.for('amplify_default')
		: '@@amplify_default'
) as Symbol;

const logger = new Logger('Hub');

export class HubClass<
	Channel extends string = string,
	EventData extends AmplifyEventDataMap = AmplifyEventDataMap
> {
	name: string;
	private listeners: IListener<Channel, EventData>[] = [];

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
		Channel extends string,
		EventData extends AmplifyEventDataMap = AmplifyEventDataMap
	>(channel: Channel, listener: HubCallback<Channel, EventData>) {
		const holder = this.listeners[channel as string];
		if (!holder) {
			logger.warn(`No listeners for ${channel}`);
			return;
		}
		this.listeners[channel as string] = [
			...holder.filter(({ callback }) => callback !== listener),
		];
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
		channel: string & {},
		payload: HubPayload,
		source?: string,
		ampSymbol?: Symbol
	): void;

	dispatch<Channel extends AmplifyChannel>(
		channel: Channel | (string & {}),
		payload: HubPayload<AmplifyEventData[Channel]> | HubPayload,
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

		const capsule: HubCapsule<Channel, EventData> = {
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
		ChannelMap extends AmplifyChannelMap = AmplifyChannelMap,
		Channel extends ChannelMap['channelType'] = ChannelMap['channelType']
	>(
		channel: Channel,
		callback: HubCallback<Channel, ChannelMap['eventData']>,
		listenerName?: string
	): () => void {
		let cb;

		if (typeof callback !== 'function') {
			throw new Error('No callback supplied to Hub');
		} else {
			cb = callback;
		}
		let holder = this.listeners[channel as string];

		if (!holder) {
			holder = [];
			this.listeners[channel as string] = holder;
		}

		holder.push({
			name: listenerName,
			callback: cb,
		});

		return () => {
			this._remove(channel, cb);
		};
	}

	private _toListeners<
		Channel extends RegExp | string,
		EventData extends AmplifyEventDataMap = AmplifyEventDataMap
	>(capsule: HubCapsule<Channel, EventData>) {
		const { channel, payload } = capsule;
		const holder = this.listeners[channel as string];
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
