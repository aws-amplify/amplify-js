var __assign =
	(this && this.__assign) ||
	function() {
		__assign =
			Object.assign ||
			function(t) {
				for (var s, i = 1, n = arguments.length; i < n; i++) {
					s = arguments[i];
					for (var p in s)
						if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
				}
				return t;
			};
		return __assign.apply(this, arguments);
	};
var __spreadArrays =
	(this && this.__spreadArrays) ||
	function() {
		for (var s = 0, i = 0, il = arguments.length; i < il; i++)
			s += arguments[i].length;
		for (var r = Array(s), k = 0, i = 0; i < il; i++)
			for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
				r[k] = a[j];
		return r;
	};
import { ConsoleLogger as Logger } from '@aws-amplify/core';
var logger = new Logger('Predictions');
var Predictions = /** @class */ (function() {
	/**
	 * Initialize Predictions with AWS configurations
	 * @param {PredictionsOptions} options - Configuration object for Predictions
	 */
	function Predictions(options) {
		this._options = options;
		this._convertPluggables = [];
		this._identifyPluggables = [];
		this._interpretPluggables = [];
	}
	Predictions.prototype.getModuleName = function() {
		return 'Predictions';
	};
	/**
	 * add plugin/pluggable into Predictions category
	 * @param {Object} pluggable - an instance of the plugin/pluggable
	 **/
	Predictions.prototype.addPluggable = function(pluggable) {
		if (this.getPluggable(pluggable.getProviderName())) {
			throw new Error(
				'Pluggable with name ' +
					pluggable.getProviderName() +
					' has already been added.'
			);
		}
		var pluggableAdded = false;
		if (this.implementsConvertPluggable(pluggable)) {
			this._convertPluggables.push(pluggable);
			pluggableAdded = true;
		}
		if (this.implementsIdentifyPluggable(pluggable)) {
			this._identifyPluggables.push(pluggable);
			pluggableAdded = true;
		}
		if (this.implementsInterpretPluggable(pluggable)) {
			this._interpretPluggables.push(pluggable);
			pluggableAdded = true;
		}
		if (pluggableAdded) {
			this.configurePluggable(pluggable);
		}
	};
	/**
	 * Get the plugin object
	 * @param providerName - the name of the plugin
	 */
	Predictions.prototype.getPluggable = function(providerName) {
		var pluggable = this.getAllProviders().find(function(pluggable) {
			return pluggable.getProviderName() === providerName;
		});
		if (pluggable === undefined) {
			logger.debug('No plugin found with providerName=>', providerName);
			return null;
		} else return pluggable;
	};
	/**
	 * Remove the plugin object
	 * @param providerName - the name of the plugin
	 */
	Predictions.prototype.removePluggable = function(providerName) {
		this._convertPluggables = this._convertPluggables.filter(function(
			pluggable
		) {
			return pluggable.getProviderName() !== providerName;
		});
		this._identifyPluggables = this._identifyPluggables.filter(function(
			pluggable
		) {
			return pluggable.getProviderName() !== providerName;
		});
		this._interpretPluggables = this._interpretPluggables.filter(function(
			pluggable
		) {
			return pluggable.getProviderName() !== providerName;
		});
		return;
	};
	/**
	 * To make both top level providers and category level providers work with same interface and configuration
	 * this method duplicates Predictions config into parent level config (for top level provider) and
	 * category level config (such as convert, identify etc) and pass both to each provider.
	 */
	Predictions.prototype.configure = function(options) {
		var _this = this;
		var predictionsConfig = options ? options.predictions || options : {};
		predictionsConfig = __assign(__assign({}, predictionsConfig), options);
		this._options = Object.assign({}, this._options, predictionsConfig);
		logger.debug('configure Predictions', this._options);
		this.getAllProviders().forEach(function(pluggable) {
			return _this.configurePluggable(pluggable);
		});
	};
	Predictions.prototype.interpret = function(input, options) {
		var pluggableToExecute = this.getPluggableToExecute(
			this._interpretPluggables,
			options
		);
		return pluggableToExecute.interpret(input);
	};
	Predictions.prototype.convert = function(input, options) {
		var pluggableToExecute = this.getPluggableToExecute(
			this._convertPluggables,
			options
		);
		return pluggableToExecute.convert(input);
	};
	Predictions.prototype.identify = function(input, options) {
		var pluggableToExecute = this.getPluggableToExecute(
			this._identifyPluggables,
			options
		);
		return pluggableToExecute.identify(input);
	};
	// tslint:disable-next-line: max-line-length
	Predictions.prototype.getPluggableToExecute = function(
		pluggables,
		providerOptions
	) {
		// Give preference to provider name first since it is more specific to this call, even if
		// there is only one provider configured to error out if the name provided is not the one matched.
		if (providerOptions && providerOptions.providerName) {
			return __spreadArrays(pluggables).find(function(pluggable) {
				return pluggable.getProviderName() === providerOptions.providerName;
			});
		} else {
			if (pluggables.length === 1) {
				return pluggables[0];
			} else {
				throw new Error(
					'More than one or no providers are configured, ' +
						'Either specify a provider name or configure exactly one provider'
				);
			}
		}
	};
	Predictions.prototype.getAllProviders = function() {
		return __spreadArrays(
			this._convertPluggables,
			this._identifyPluggables,
			this._interpretPluggables
		);
	};
	Predictions.prototype.configurePluggable = function(pluggable) {
		var categoryConfig = Object.assign(
			{},
			this._options['predictions'], // Parent predictions config for the top level provider
			this._options[pluggable.getCategory().toLowerCase()] // Actual category level config
		);
		pluggable.configure(categoryConfig);
	};
	Predictions.prototype.implementsConvertPluggable = function(obj) {
		return obj && typeof obj.convert === 'function';
	};
	Predictions.prototype.implementsIdentifyPluggable = function(obj) {
		return obj && typeof obj.identify === 'function';
	};
	Predictions.prototype.implementsInterpretPluggable = function(obj) {
		return obj && typeof obj.interpret === 'function';
	};
	return Predictions;
})();
export default Predictions;
//# sourceMappingURL=Predictions.js.map
