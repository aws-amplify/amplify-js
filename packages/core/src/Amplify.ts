import { ConsoleLogger as LoggerClass } from './Logger';

const logger = new LoggerClass('Amplify');

export class AmplifyClass {
	private _components = [];
	private _config = {};

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

	Logger = LoggerClass;
	ServiceWorker = null;

	register(comp) {
		logger.debug('component registered in amplify', comp);
		this._components.push(comp);
		if (typeof comp.getModuleName === 'function') {
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
		this._components.map(comp => {
			// Dependency Injection via property-setting.
			// This avoids introducing a public method/interface/setter that's difficult to remove later.
			// Plus, it reduces `if` statements within the `constructor` and `configure` of each module
			if (comp.hasOwnProperty('amplify')) {
				comp.amplify = this;
			}

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

/**
 * @deprecated use named import
 */
export default Amplify;
