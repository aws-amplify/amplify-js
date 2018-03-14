"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CognitoCredentials_1 = require("./Providers/CognitoCredentials");
var Common_1 = require("../Common");
var logger = new Common_1.ConsoleLogger('Auth');
var Credentials = /** @class */ (function () {
    function Credentials() {
        this._config = {};
        this._pluggables = [];
        this.addPluggable(new CognitoCredentials_1.default());
    }
    /**
     * Configure
     * @param {Object} config - the configuration
     */
    Credentials.prototype.configure = function (config) {
        logger.debug('configure Credentials');
        var conf = Object.assign({}, this._config, Common_1.Parser.parseMobilehubConfig(config).Credentials);
        this._config = conf;
        logger.debug('credentials config', this._config);
        this._pluggables.map(function (pluggable) {
            pluggable.configure(conf);
        });
        return this._config;
    };
    /**
     * Add pluggables to Credentials category
     * @param {Object} pluggable - plugin
     */
    Credentials.prototype.addPluggable = function (pluggable) {
        if (pluggable) {
            this._pluggables.push(pluggable);
            var config = pluggable.configure(this._config);
            return config;
        }
    };
    /**
     * Set credentials with configuration
     * @param {Object} config - the configuration
     */
    Credentials.prototype.setCredentials = function (config) {
        var _this = this;
        var providerName = 'AWSCognito';
        if (config && config.providerName)
            providerName = config.providerName;
        return new Promise(function (res, rej) {
            _this._pluggables.map(function (pluggable) {
                if (pluggable.getProviderName() === providerName) {
                    pluggable.setCredentials(config)
                        .then(function (cred) {
                        res(cred);
                    }).catch(function (e) {
                        rej('set credentials failed: ' + e);
                    });
                }
                else {
                    logger.debug('no provider found');
                    res(null);
                }
            });
        });
    };
    /**
     * Remove credentials with configuration
     * @param {Object} config - the configuraiton
     */
    Credentials.prototype.removeCredentials = function (config) {
        var providerName = 'AWSCognito';
        if (config && config.providerName)
            providerName = config.providerName;
        this._pluggables.map(function (pluggable) {
            if (pluggable.getProviderName() === providerName) {
                pluggable.removeCredentials();
            }
        });
    };
    /**
     * cut credentials to compact version
     * @param params
     */
    Credentials.prototype.essentialCredentials = function (params) {
        var providerName = 'AWSCognito';
        if (params && params.providerName)
            providerName = params.providerName;
        var ret = null;
        this._pluggables.map(function (pluggable) {
            if (pluggable.getProviderName() === providerName) {
                ret = pluggable.essentialCredentials(params);
            }
        });
        return ret;
    };
    /**
     * Get credentials with configuration
     * @param {Object} config - the configuraiton
     */
    Credentials.prototype.getCredentials = function (config) {
        var providerName = 'AWSCognito';
        if (config && config.providerName)
            providerName = config.providerName;
        var that = this;
        return new Promise(function (res, rej) {
            that._pluggables.map(function (pluggable) {
                if (providerName && pluggable.getProviderName() === providerName) {
                    pluggable.getCredentials(config)
                        .then(function (cred) {
                        res(cred);
                    }).catch(function (err) {
                        res(null);
                    });
                }
                else {
                    logger.debug('no provider found');
                    res(null);
                }
            });
        });
    };
    return Credentials;
}());
exports.default = Credentials;
//# sourceMappingURL=Credentials.js.map