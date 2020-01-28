'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var Logger_1 = require('./Logger');
var logger = new Logger_1.ConsoleLogger('Amplify');
var Amplify = /** @class */ (function() {
	function Amplify() {}
	Amplify.register = function(comp) {
		logger.debug('component registered in amplify', comp);
		this._components.push(comp);
		if (typeof comp.getModuleName === 'function') {
			Amplify[comp.getModuleName()] = comp;
		} else {
			logger.debug('no getModuleName method for component', comp);
		}
	};
	Amplify.configure = function(config) {
		var _this = this;
		if (!config) return this._config;
		this._config = Object.assign(this._config, config);
		logger.debug('amplify config', this._config);
		this._components.map(function(comp) {
			comp.configure(_this._config);
		});
		return this._config;
	};
	Amplify.addPluggable = function(pluggable) {
		if (
			pluggable &&
			pluggable['getCategory'] &&
			typeof pluggable['getCategory'] === 'function'
		) {
			this._components.map(function(comp) {
				if (
					comp['addPluggable'] &&
					typeof comp['addPluggable'] === 'function'
				) {
					comp.addPluggable(pluggable);
				}
			});
		}
	};
	Amplify._components = [];
	Amplify._config = {};
	// for backward compatibility to avoid breaking change
	// if someone is using like Amplify.Auth
	Amplify.Auth = null;
	Amplify.Analytics = null;
	Amplify.API = null;
	Amplify.Storage = null;
	Amplify.I18n = null;
	Amplify.Cache = null;
	Amplify.PubSub = null;
	Amplify.Interactions = null;
	Amplify.Pushnotification = null;
	Amplify.UI = null;
	Amplify.XR = null;
	Amplify.Predictions = null;
	Amplify.Logger = Logger_1.ConsoleLogger;
	Amplify.ServiceWorker = null;
	return Amplify;
})();
exports.default = Amplify;
//# sourceMappingURL=Amplify.js.map
