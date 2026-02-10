// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ConsoleLogger as LoggerClass } from './Logger';

const logger = new LoggerClass('Amplify');

export class AmplifyClass {
	// Everything that is `register`ed is tracked here
	private _components = [];
	private _config = {};

	// All modules (with `getModuleName()`) are stored here for dependency injection
	private _modules = {};

	// for backward compatibility to avoid breaking change
	// if someone is using like Amplify.Auth
	Auth = null;
	Analytics = null;
	API = null;
	Credentials = null;
	Storage = null;
	I18n = null;
	Cache = null;
	PubSub = null;
	Interactions = null;
	Pushnotification = null;
	UI = null;
	XR = null;
	Predictions = null;
	DataStore = null;
	Geo = null;
	Notifications = null;

	Logger = LoggerClass;
	ServiceWorker = null;

	register(comp) {
		logger.debug('component registered in amplify', comp);
		this._components.push(comp);
		if (typeof comp.getModuleName === 'function') {
			this._modules[comp.getModuleName()] = comp;
			this[comp.getModuleName()] = comp;
		} else {
			logger.debug('no getModuleName method for component', comp);
		}

		// Finally configure this new component(category) loaded
		// With the new modularization changes in Amplify V3, all the Amplify
		// component are not loaded/registered right away but when they are
		// imported (and hence instantiated) in the client's app. This ensures
		// that all new components imported get correctly configured with the
		// configuration that Amplify.configure() was called with.
		comp.configure(this._config);
	}

	configure(config?) {
		if (!config) return this._config;

		this._config = Object.assign(this._config, config);
		logger.debug('amplify config', this._config);

		// Warn if Pinpoint is configured
		if (
			(this._config['Analytics'] && (this._config['Analytics']['AWSPinpoint'] || this._config['Analytics']['appId'])) ||
			(this._config['Notifications'] && this._config['Notifications']['InAppMessaging'] && this._config['Notifications']['InAppMessaging']['AWSPinpoint']) ||
			(this._config['Notifications'] && this._config['Notifications']['Push'] && this._config['Notifications']['Push']['AWSPinpoint']) ||
			(this._config['PushNotification'] && this._config['PushNotification']['appId'])
		) {
			// eslint-disable-next-line no-console
			console.warn(
				'AWS will end support for Amazon Pinpoint on October 30, 2026. ' +
					'The guidance is to use AWS End User Messaging for push notifications and SMS, ' +
					'Amazon Simple Email Service for sending emails, Amazon Connect for campaigns, journeys, endpoints, and engagement analytics. ' +
					'Pinpoint recommends Amazon Kinesis for event collection and mobile analytics.'
			);
		}

		// Dependency Injection via property-setting.
		// This avoids introducing a public method/interface/setter that's difficult to remove later.
		// Plus, it reduces `if` statements within the `constructor` and `configure` of each module
		Object.entries(this._modules).forEach(([Name, comp]) => {
			// e.g. Auth.*
			Object.keys(comp).forEach(property => {
				// e.g. Auth["Credentials"] = this._modules["Credentials"] when set
				if (this._modules[property]) {
					comp[property] = this._modules[property];
				}
			});
		});

		this._components.map(comp => {
			comp.configure(this._config);
		});

		return this._config;
	}

	addPluggable(pluggable) {
		if (
			pluggable &&
			pluggable['getCategory'] &&
			typeof pluggable['getCategory'] === 'function'
		) {
			this._components.map(comp => {
				if (
					comp['addPluggable'] &&
					typeof comp['addPluggable'] === 'function'
				) {
					comp.addPluggable(pluggable);
				}
			});
		}
	}
}

export const Amplify = new AmplifyClass();
