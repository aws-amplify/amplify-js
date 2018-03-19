"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
var CognitoCredentials_1 = require("./Providers/CognitoCredentials");
var Common_1 = require("../Common");
var logger = new Common_1.ConsoleLogger('Auth');
var CredentialsClass = /** @class */ (function () {
    function CredentialsClass() {
        this._config = {};
        this._pluggables = [];
        this.addPluggable(new CognitoCredentials_1.default());
    }
    /**
     * Configure
     * @param {Object} config - the configuration
     */
    CredentialsClass.prototype.configure = function (config) {
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
    CredentialsClass.prototype.addPluggable = function (pluggable) {
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
    CredentialsClass.prototype.setCredentials = function (config) {
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
    CredentialsClass.prototype.removeCredentials = function (config) {
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
    CredentialsClass.prototype.essentialCredentials = function (params) {
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
    CredentialsClass.prototype.getCredentials = function (config) {
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
    /**
     * Get current session with configuration
     * @param config
     */
    CredentialsClass.prototype.currentSession = function (config) {
        var providerName = 'AWSCognito';
        if (config && config.providerName)
            providerName = config.providerName;
        var that = this;
        return new Promise(function (res, rej) {
            that._pluggables.map(function (pluggable) {
                if (providerName && pluggable.getProviderName() === providerName) {
                    pluggable.currentSession(config)
                        .then(function (session) {
                        res(session);
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
    return CredentialsClass;
}());
exports.default = CredentialsClass;
//# sourceMappingURL=Credentials.js.map