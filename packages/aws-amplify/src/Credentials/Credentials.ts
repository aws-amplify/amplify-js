import CognitoCredentials from './CognitoCredentials';
import {
    ConsoleLogger as Logger,
    Parser
} from '../Common';

const logger = new Logger('Auth');

export default class Credentials{
    private _config;
    private _pluggables;

    constructor() {
        this._config = {};
        this._pluggables = [];
    }

    configure(config) {
        logger.debug('configure Credentials');
        const conf = Object.assign({}, this._config, Parser.parseMobilehubConfig(config).Credentials);

        this._config = conf;
        logger.debug('credentials config', this._config);
        this._pluggables.map((pluggable) => {
            pluggable.configure(conf);
        });

        if (this._pluggables.length === 0) {
            this.addPluggable(new CognitoCredentials());
        }

        return this._config;
    }

    public addPluggable(pluggable) {
        if (pluggable) {
            this._pluggables.push(pluggable);
            const config = pluggable.configure(this._config);
            return config;
        }
    }

    public setCredentials(config?) {
        let providerName = 'AWSCognito';
        if (config && config.providerName) providerName = config.providerName;

        return new Promise((res, rej) => {
            this._pluggables.map((pluggable) => {
                if (pluggable.getProviderName() === providerName) {
                    pluggable.setCredentials(config)
                        .then(cred => {
                            res(cred);
                        }).catch(e => {
                            rej('set credentials failed: ' + e);
                        });
                }
            });
        });
    }

    public removeCredentials(config?) {
        let providerName = 'AWSCognito';
        if (config && config.providerName) providerName = config.providerName;

        this._pluggables.map((pluggable) => {
            if (pluggable.getProviderName() === providerName) {
                pluggable.removeCredentials();
            }
        });
    }

    public essentialCredentials(params) {
        let providerName = 'AWSCognito';
        if (params && params.providerName) providerName = params.providerName;

        let ret = null;
        this._pluggables.map((pluggable) => {
            if (pluggable.getProviderName() === providerName) {
                ret = pluggable.essentialCredentials(params);
            }
        });

        return ret;
    }

    public getCredentials(config?) {
        let providerName = 'AWSCognito';
        if (config && config.providerName) providerName = config.providerName;

        const that = this;
        return new Promise((res, rej) => {
            that._pluggables.map((pluggable) => {
                if (providerName && pluggable.getProviderName() === providerName) {
                    pluggable.getCredentials(config)
                        .then(cred => {
                            res(cred);
                        }).catch(err => {
                            res(null);
                        });
                    }
                });
        });
    }
}
