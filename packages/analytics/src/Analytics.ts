// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
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
