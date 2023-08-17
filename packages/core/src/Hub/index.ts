// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger as Logger } from '../Logger';
import {
	AmplifyChannelMap,
	AmplifyEventDataMap,
	GetHubCallBack,
	HubCallback,
	HubCapsule,
	HubPayload,
	IListener,
	IPattern,
} from './types';

export const AMPLIFY_SYMBOL = (
	typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
		? Symbol.for('amplify_default')
		: '@@amplify_default'
) as Symbol;

const logger = new Logger('Hub');

export class HubClass {
	name: string;
	private listeners: IListener[] = [];
	private patterns: IPattern<any>[] = [];

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
		Channel extends string | RegExp,
		EventData extends AmplifyEventDataMap = AmplifyEventDataMap
	>(channel: Channel, listener: HubCallback<string | RegExp, EventData>) {
		{
			if (channel instanceof RegExp) {
				const pattern = this.patterns.find(
					({ pattern }) => pattern.source === channel.source
				);
				if (!pattern) {
					logger.warn(`No listeners for ${channel}`);
					return;
				}
				this.patterns = [...this.patterns.filter(x => x !== pattern)];
			} else {
				const holder = this.listeners[channel as string];
				if (!holder) {
					logger.warn(`No listeners for ${channel}`);
					return;
				}
				this.listeners[channel as string] = [
					...holder.filter(({ callback }) => callback !== listener),
				];
				this.listeners[channel as string] = [
					...holder.filter(({ callback }) => callback !== listener),
				];
			}
		}
	}

	/**
	 * @deprecated Instead of calling Hub.remove, call the result of Hub.listen.
	 */
	remove<
		Channel extends string | RegExp,
		EventData extends AmplifyEventDataMap = AmplifyEventDataMap
	>(channel: Channel, listener: HubCallback<string | RegExp, EventData>) {
		this._remove(channel, listener);
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
	dispatch<
		EventData extends AmplifyEventDataMap,
		ChannelMap extends AmplifyChannelMap,
		Channel extends ChannelMap['channel'] = ChannelMap['channel']
	>(
		channel: Channel,
		payload: HubPayload<EventData>,
		source = '',
		ampSymbol?: Symbol
	): void {
    if (typeof channel === 'string' && this.protectedChannels.indexOf(channel) > -1) {
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
		ChannelMap extends AmplifyChannelMap,
		Channel extends ChannelMap['channel'] = ChannelMap['channel']
	>(
		channel: Channel,
		callback: GetHubCallBack<Channel, ChannelMap['eventData']>,
		listenerName?: string
	): () => void {
		let cb: GetHubCallBack<Channel, ChannelMap['eventData']>;

		if (typeof callback !== 'function') {
			throw new Error('No callback supplied to Hub');
		} else {
			cb = callback;
		}

		if (channel instanceof RegExp) {
			this.patterns.push({
				pattern: channel,
				callback: cb,
			});
		} else {
			let holder = this.listeners[channel as string];

			if (!holder) {
				holder = [];
				this.listeners[channel as string] = holder;
			}

			holder.push({
				name: listenerName,
				callback: cb,
			});
		}

		return () => {
			this._remove(channel, cb);
		};
	}

	private _toListeners<
		Channel extends string | RegExp,
		EventDataMap extends AmplifyEventDataMap
	>(capsule: HubCapsule<Channel, EventDataMap>) {
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

		if (this.patterns.length > 0) {
			if (!payload.message) {
				logger.warn(`Cannot perform pattern matching without a message key`);
				return;
			}

			const payloadStr = payload.message;

			this.patterns.forEach(pattern => {
				const match = payloadStr.match(pattern.pattern);
				if (match) {
					const [, ...groups] = match;
					const dispatchingCapsule: HubCapsule<Channel, EventDataMap> = {
						...capsule,
						patternInfo: groups,
					};
					try {
						pattern.callback(dispatchingCapsule);
					} catch (e) {
						logger.error(e);
					}
				}
			});
		}
	}
}

/*We export a __default__ instance of HubClass to use it as a 
pseudo Singleton for the main messaging bus, however you can still create
your own instance of HubClass() for a separate "private bus" of events.*/
export const Hub = new HubClass('__default__');
