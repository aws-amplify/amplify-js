"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CognitoCredentials_1 = require("./CognitoCredentials");
var Common_1 = require("../Common");
var logger = new Common_1.ConsoleLogger('Auth');
var Credentials = /** @class */ (function () {
    function Credentials() {
        this._config = {};
        this._pluggables = [];
        this.addPluggable(new CognitoCredentials_1.default());
    }
    Credentials.prototype.configure = function (config) {
        logger.debug('configure Credentials');
        var conf = Object.assign({}, this._config, Common_1.Parser.parseMobilehubConfig(config).Credentials);
        this._config = conf;
        logger.debug('credentials config', this._config);
        this._pluggables.map(function (pluggable) {
            pluggable.configure(conf);
        });
        // if (this._pluggables.length === 0) {
        // }
        return this._config;
    };
    Credentials.prototype.addPluggable = function (pluggable) {
        if (pluggable) {
            this._pluggables.push(pluggable);
            var config = pluggable.configure(this._config);
            return config;
        }
    };
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
            });
        });
    };
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
            });
        });
    };
    return Credentials;
}());
exports.default = Credentials;
//# sourceMappingURL=Credentials.js.map