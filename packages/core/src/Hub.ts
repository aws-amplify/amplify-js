// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger as Logger } from './Logger';

const logger = new Logger('Hub');

const AMPLIFY_SYMBOL = (
	typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
		? Symbol.for('amplify_default')
		: '@@amplify_default'
) as Symbol;

/**
 * Utility type to infer the payload type of another HubClass instance.
 *
 * @template T The type of the HubClass instance to infer the payload type from.
 *
 * @example
 * type CustomPayloadType = { ... };
 * const OtherHub = new HubClass<OtherPayloadType>('__default__');
 * const CustomHub = new HubClass<CustomPayloadType & InferHubPayload<typeof OtherHub>>('HubName');
 */
export type InferHubTypes<T extends HubClass<any>> = T extends HubClass<infer U>
	? U
	: never;

/**
 * Utility type to get the potential payload types for a channel.
 *
 * @template Map - ChannelEventPayloadMap to extract event and payload types from.
 * @template Channel - Channel to check for event payloads, keyof Map or RegExp.
 * @returns Union of payload types for a channel.
 */
export type GetHubPayloads<
	Map extends ChannelEventPayloadMap,
	Channel extends keyof Map | RegExp
> = GetPayloads<Map, Channel>;

/*
Type to enable autocompletion for channel names while also accepting arbitrary strings.
In TypeScript v3.8.3, we need to include '| keyof ChannelMap' to ensure correct behavior:
    channel: Channel | keyof ChannelMap

See https://github.com/microsoft/TypeScript/issues/29729
*/
type ChannelAutocomplete<ChannelMap extends ChannelEventPayloadMap> =
	| (keyof ChannelMap & string)
	| (string & {});

interface IPattern<P extends HubPayload = HubPayload> {
	pattern: RegExp;
	callback: HubCallback<P>;
}

interface IListener<P extends HubPayload = HubPayload> {
	name: string;
	callback: HubCallback<P>;
}

export type HubCapsule<P extends HubPayload = HubPayload> = {
	channel: string;
	payload: P;
	source: string;
	patternInfo?: string[];
};

export type HubPayload<Event = string, Data = any> = {
	event: Event;
	data?: Data;
	message?: string | null;
};

export type HubCallback<P extends HubPayload = HubPayload> = (
	capsule: HubCapsule<P>
) => void;

export type LegacyCallback<P extends HubPayload = HubPayload> = {
	onHubCapsule: HubCallback<P>;
};

type ChannelEventPayloadMap = Record<string, Record<string, any>>;

type GetEvents<
	ChannelMap extends ChannelEventPayloadMap,
	Channel extends keyof ChannelMap | RegExp
> = Channel extends keyof ChannelMap
	? keyof ChannelMap[Channel] & string
	: string;

type GetPayloads<
	Map extends ChannelEventPayloadMap,
	Channel extends keyof Map | RegExp,
	Event extends GetEvents<Map, Channel> = GetEvents<Map, Channel>
> = Event extends Event
	? Channel extends keyof Map
		? Event extends keyof Map[Channel]
			? undefined extends Map[Channel][Event]
				? HubPayload<Event, Map[Channel][Event]> // nullable data
				: HubPayload<Event, Map[Channel][Event]> & { data: Map[Channel][Event] } // non-nullable data
			: HubPayload // unknown event
		: HubPayload // unknown channel
	: never;

function isLegacyCallback(callback: any): callback is LegacyCallback {
	return (<LegacyCallback>callback).onHubCapsule !== undefined;
}

export class HubClass<ChannelMap extends ChannelEventPayloadMap> {
	name: string;
	private listeners: { [key: string]: IListener<any>[] } = {};
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
	private _remove<Channel extends ChannelAutocomplete<ChannelMap> | RegExp>(
		channel: Channel | keyof ChannelMap | RegExp,
		listener: HubCallback<GetPayloads<ChannelMap, Channel>>
	) {
		if (channel instanceof RegExp) {
			const pattern = this.patterns.find(
				({ pattern }) => pattern.source === channel.source
			);
			if (!pattern) {
				logger.warn(`No listeners for ${channel}`);
				return;
			}
			this.patterns = [...this.patterns.filter(x => x !== pattern)];
		} else if (typeof channel === 'string') {
			const holder = this.listeners[channel];
			if (!holder) {
				logger.warn(`No listeners for ${channel}`);
				return;
			}
			this.listeners[channel] = [
				...holder.filter(({ callback }) => callback !== listener),
			];
		} else {
			throw new Error(
				`Invalid channel type, expected string | RegExp, got  ${typeof channel}`
			);
		}
	}

	/**
	 * @deprecated Instead of calling Hub.remove, call the result of Hub.listen.
	 */
	remove<Channel extends ChannelAutocomplete<ChannelMap> | RegExp>(
		channel: Channel | keyof ChannelMap | RegExp,
		listener: HubCallback<GetPayloads<ChannelMap, Channel>>
	) {
		this._remove(channel, listener);
	}

	/**
	 * Used to send a Hub event.
	 *
	 * @template Channel The type of the channel on which the event will be broadcast, string.
	 *
	 * @param channel - The channel on which the event will be broadcast.
	 * @param payload - The HubPayload containing event data.
	 * @param source  - The source of the event; defaults to ''.
	 * @param ampSymbol - Symbol used to determine if the event is dispatched internally on a protected channel.
	 */
	dispatch<Channel extends ChannelAutocomplete<ChannelMap>>(
		channel: Channel | (keyof ChannelMap & string),
		payload: GetPayloads<ChannelMap, Channel>,
		source = '',
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
	 * @template Channel The type of the channel on which the listener will listen, RegExp | string.
	 *
	 * @param channel - The channel on which to listen
	 * @param callback - The callback to execute when an event is received on the specified channel
	 * @param listenerName - The name of the listener; defaults to 'noname'
	 * @returns A function which can be called to cancel the listener.
	 *
	 */
	listen<Channel extends ChannelAutocomplete<ChannelMap>>(
		channel: Channel | keyof ChannelMap | RegExp,
		callback?:
			| HubCallback<GetPayloads<ChannelMap, Channel>>
			| LegacyCallback<GetPayloads<ChannelMap, Channel>>,
		listenerName = 'noname'
	) {
		let cb: HubCallback<GetPayloads<ChannelMap, Channel>>;
		// Check for legacy onHubCapsule callback for backwards compatability
		if (isLegacyCallback(callback)) {
			logger.warn(
				`WARNING onHubCapsule is Deprecated. Please pass in a callback.`
			);
			cb = callback.onHubCapsule.bind(callback);
		} else if (typeof callback !== 'function') {
			throw new Error('No callback supplied to Hub');
		} else {
			cb = callback;
		}

		if (channel instanceof RegExp) {
			this.patterns.push({
				pattern: channel,
				callback: cb,
			});
		} else if (typeof channel === 'string') {
			let holder = this.listeners[channel];

			if (!holder) {
				holder = [];
				this.listeners[channel] = holder;
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

	private _toListeners(capsule: HubCapsule) {
		const { channel, payload } = capsule;
		const holder = this.listeners[channel];

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
					const dispatchingCapsule: HubCapsule = {
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
