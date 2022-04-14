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

import {
	Amplify,
	ConsoleLogger as Logger,
	Hub,
	Parser,
} from '@aws-amplify/core';
import { AWSPinpointProvider } from './Providers/AWSPinpointProvider';

import {
	AnalyticsProvider,
	EventAttributes,
	EventMetrics,
	AnalyticsEvent,
	AutoTrackSessionOpts,
	AutoTrackPageViewOpts,
	AutoTrackEventOpts,
} from './types';
import { PageViewTracker, EventTracker, SessionTracker } from './trackers';

const logger = new Logger('AnalyticsClass');

const AMPLIFY_SYMBOL = (
	typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
		? Symbol.for('amplify_default')
		: '@@amplify_default'
) as Symbol;

const dispatchAnalyticsEvent = (event: string, data: any, message: string) => {
	Hub.dispatch(
		'analytics',
		{ event, data, message },
		'Analytics',
		AMPLIFY_SYMBOL
	);
};

const trackers = {
	pageView: PageViewTracker,
	event: EventTracker,
	session: SessionTracker,
};

type TrackerTypes = keyof typeof trackers;
type Trackers = typeof trackers[TrackerTypes];
let _instance = null;

/**
 * Provide mobile analytics client functions
 */
export class AnalyticsClass {
	private _config;
	private _pluggables: AnalyticsProvider[];
	private _disabled: boolean;
	private _trackers: Trackers | {};

	/**
	 * Initialize Analtyics
	 * @param config - Configuration of the Analytics
	 */
	constructor() {
		this._config = {};
		this._pluggables = [];
		this._disabled = false;
		this._trackers = {};
		_instance = this;

		this.record = this.record.bind(this);
		Hub.listen('auth', listener);
		Hub.listen('storage', listener);
		Hub.listen('analytics', listener);
	}

	public getModuleName() {
		return 'Analytics';
	}
	/**
	 * configure Analytics
	 * @param {Object} config - Configuration of the Analytics
	 */
	public configure(config?) {
		if (!config) return this._config;
		logger.debug('configure Analytics', config);
		const amplifyConfig = Parser.parseMobilehubConfig(config);
		this._config = Object.assign(
			{},
			this._config,
			amplifyConfig.Analytics,
			config
		);

		if (this._config['disabled']) {
			this._disabled = true;
		}

		// turn on the autoSessionRecord if not specified
		if (this._config['autoSessionRecord'] === undefined) {
			this._config['autoSessionRecord'] = true;
		}

		this._pluggables.forEach(pluggable => {
			// for backward compatibility
			const providerConfig =
				pluggable.getProviderName() === 'AWSPinpoint' &&
				!this._config['AWSPinpoint']
					? this._config
					: this._config[pluggable.getProviderName()];

			pluggable.configure({
				disabled: this._config['disabled'],
				autoSessionRecord: this._config['autoSessionRecord'],
				...providerConfig,
			});
		});

		if (this._pluggables.length === 0) {
			this.addPluggable(new AWSPinpointProvider());
		}

		dispatchAnalyticsEvent(
			'configured',
			null,
			`The Analytics category has been configured successfully`
		);
		logger.debug('current configuration', this._config);
		return this._config;
	}

	/**
	 * add plugin into Analytics category
	 * @param pluggable - an instance of the plugin
	 */
	public addPluggable(pluggable: AnalyticsProvider) {
		if (pluggable && pluggable.getCategory() === 'Analytics') {
			this._pluggables.push(pluggable);
			// for backward compatibility
			const providerConfig =
				pluggable.getProviderName() === 'AWSPinpoint' &&
				!this._config['AWSPinpoint']
					? this._config
					: this._config[pluggable.getProviderName()];
			const config = { disabled: this._config['disabled'], ...providerConfig };
			pluggable.configure(config);
			return config;
		}
	}

	/**
	 * Get the plugin object
	 * @param providerName - the name of the provider to be removed
	 */
	public getPluggable(providerName: string): AnalyticsProvider {
		for (let i = 0; i < this._pluggables.length; i += 1) {
			const pluggable = this._pluggables[i];
			if (pluggable.getProviderName() === providerName) {
				return pluggable;
			}
		}

		logger.debug('No plugin found with providerName', providerName);
		return null;
	}

	/**
	 * Remove the plugin object
	 * @param providerName - the name of the provider to be removed
	 */
	public removePluggable(providerName: string): void {
		let idx = 0;
		while (idx < this._pluggables.length) {
			if (this._pluggables[idx].getProviderName() === providerName) {
				break;
			}
			idx += 1;
		}

		if (idx === this._pluggables.length) {
			logger.debug('No plugin found with providerName', providerName);
			return;
		} else {
			this._pluggables.splice(idx, idx + 1);
			return;
		}
	}

	/**
	 * stop sending events
	 */
	public disable() {
		this._disabled = true;
	}

	/**
	 * start sending events
	 */
	public enable() {
		this._disabled = false;
	}

	/**
	 * Record Session start
	 * @param [provider] - name of the provider.
	 * @return - A promise which resolves if buffer doesn't overflow
	 */
	public async startSession(provider?: string) {
		const params = { event: { name: '_session.start' }, provider };
		return this._sendEvent(params);
	}

	/**
	 * Record Session stop
	 * @param [provider] - name of the provider.
	 * @return - A promise which resolves if buffer doesn't overflow
	 */
	public async stopSession(provider?: string) {
		const params = { event: { name: '_session.stop' }, provider };
		return this._sendEvent(params);
	}

	/**
	 * Record one analytic event and send it to Pinpoint
	 * @param event - An object with the name of the event, attributes of the event and event metrics.
	 * @param [provider] - name of the provider.
	 */
	public async record(event: AnalyticsEvent, provider?: string);
	/**
	 * Record one analytic event and send it to Pinpoint
	 * @deprecated Use the new syntax and pass in the event as an object instead.
	 * @param eventName - The name of the event
	 * @param [attributes] - Attributes of the event
	 * @param [metrics] - Event metrics
	 * @return - A promise which resolves if buffer doesn't overflow
	 */
	public async record(
		eventName: string,
		attributes?: EventAttributes,
		metrics?: EventMetrics
	);
	public async record(
		event: string | AnalyticsEvent,
		providerOrAttributes?: string | EventAttributes,
		metrics?: EventMetrics
	) {
		let params = null;
		// this is just for compatibility, going to be deprecated
		if (typeof event === 'string') {
			params = {
				event: {
					name: event,
					attributes: providerOrAttributes,
					metrics,
				},
				provider: 'AWSPinpoint',
			};
		} else {
			params = { event, provider: providerOrAttributes };
		}
		return this._sendEvent(params);
	}

	public async updateEndpoint(
		attrs: { [key: string]: any },
		provider?: string
	) {
		const event = { ...attrs, name: '_update_endpoint' };

		return this.record(event, provider);
	}

	private _sendEvent(params: { event: AnalyticsEvent; provider?: string }) {
		if (this._disabled) {
			logger.debug('Analytics has been disabled');
			return Promise.resolve();
		}

		const provider = params.provider ? params.provider : 'AWSPinpoint';

		return new Promise((resolve, reject) => {
			this._pluggables.forEach(pluggable => {
				if (pluggable.getProviderName() === provider) {
					pluggable.record(params, { resolve, reject });
				}
			});
		});
	}

	/**
	 * Enable or disable auto tracking
	 * @param trackerType - The type of tracker to activate.
	 * @param [opts] - Auto tracking options.
	 */
	public autoTrack(trackerType: 'session', opts: AutoTrackSessionOpts);
	public autoTrack(trackerType: 'pageView', opts: AutoTrackPageViewOpts);
	public autoTrack(trackerType: 'event', opts: AutoTrackEventOpts);
	// ensures backwards compatibility for non-pinpoint provider users
	public autoTrack(
		trackerType: TrackerTypes,
		opts: { provider: string; [key: string]: any }
	);
	public autoTrack(trackerType: TrackerTypes, opts: { [key: string]: any }) {
		if (!trackers[trackerType]) {
			logger.debug('invalid tracker type');
			return;
		}

		// to sync up two different configuration ways of auto session tracking
		if (trackerType === 'session') {
			this._config['autoSessionRecord'] = opts['enable'];
		}

		const tracker = this._trackers[trackerType];
		if (!tracker) {
			this._trackers[trackerType] = new trackers[trackerType](
				this.record,
				opts
			);
		} else {
			tracker.configure(opts);
		}
	}
}

let endpointUpdated = false;
let authConfigured = false;
let analyticsConfigured = false;
const listener = capsule => {
	const { channel, payload } = capsule;
	logger.debug('on hub capsule ' + channel, payload);

	switch (channel) {
		case 'auth':
			authEvent(payload);
			break;
		case 'storage':
			storageEvent(payload);
			break;
		case 'analytics':
			analyticsEvent(payload);
			break;
		default:
			break;
	}
};

const storageEvent = payload => {
	const {
		data: { attrs, metrics },
	} = payload;
	if (!attrs) return;

	if (analyticsConfigured) {
		_instance
			.record({
				name: 'Storage',
				attributes: attrs,
				metrics,
			})
			.catch(e => {
				logger.debug('Failed to send the storage event automatically', e);
			});
	}
};

const authEvent = payload => {
	const { event } = payload;
	if (!event) {
		return;
	}

	const recordAuthEvent = async eventName => {
		if (authConfigured && analyticsConfigured) {
			try {
				return await _instance.record({ name: `_userauth.${eventName}` });
			} catch (err) {
				logger.debug(
					`Failed to send the ${eventName} event automatically`,
					err
				);
			}
		}
	};

	switch (event) {
		case 'signIn':
			return recordAuthEvent('sign_in');
		case 'signUp':
			return recordAuthEvent('sign_up');
		case 'signOut':
			return recordAuthEvent('sign_out');
		case 'signIn_failure':
			return recordAuthEvent('auth_fail');
		case 'configured':
			authConfigured = true;
			if (authConfigured && analyticsConfigured) {
				sendEvents();
			}
			break;
	}
};

const analyticsEvent = payload => {
	const { event } = payload;
	if (!event) return;

	switch (event) {
		case 'pinpointProvider_configured':
			analyticsConfigured = true;
			if (authConfigured && analyticsConfigured) {
				sendEvents();
			}
			break;
	}
};

const sendEvents = () => {
	const config = _instance.configure();
	if (!endpointUpdated && config['autoSessionRecord']) {
		_instance.updateEndpoint({ immediate: true }).catch(e => {
			logger.debug('Failed to update the endpoint', e);
		});
		endpointUpdated = true;
	}
	_instance.autoTrack('session', {
		enable: config['autoSessionRecord'],
	});
};

export const Analytics = new AnalyticsClass();
Amplify.register(Analytics);
