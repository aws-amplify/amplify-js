import CognitoCredentials from './CognitoCredentials';
import {
    ConsoleLogger as Logger
} from '../Common';

const logger = new Logger('Auth');

export default class Credentials{
    private _config;
    private _pluggables;

    constructor() {
        this._config = {};
        this._pluggables = [];

        this._pluggables.push(new CognitoCredentials());
    }

    configure(config) {
        logger.debug('configure Credentials');
        // will be moved into Parser
        const amplifyConfig = {};
        if (config['aws_cognito_identity_pool_id']) {
            const credConfig = {};
            credConfig['cognitoIdentityPoolId'] = config['aws_cognito_identity_pool_id'];
            credConfig['cognitoRegion'] = config['aws_cognito_region'];
            credConfig['cognitoUserPoolId'] = config['aws_user_pools_id'];
            amplifyConfig['Credentials'] = credConfig;
        }
        amplifyConfig['Credentials'] = Object.assign({}, amplifyConfig['Credentials'], config.Credentials);

        const conf = Object.assign({}, this._config, amplifyConfig['Credentials']);
        this._config = conf;
        this._pluggables.map((pluggable) => {
            pluggable.configure(conf);
        })

        return this._config;
    }

    public addPluggable(pluggable) {

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
                        })
                    }
                });
        });
    }
}
