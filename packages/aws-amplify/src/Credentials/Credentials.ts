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
    }

    public addPluggable(pluggable) {

    }

    public setCredentils(config) {
        const { providerName } = config;
        this._pluggables.map((pluggable) => {
            if (pluggable.getProviderName() === providerName) {
                pluggable.setCredentils(config);
            }
        });
    }

    public removeCredentials(config) {
        const { providerName } = config;
        this._pluggables.map((pluggable) => {
            if (pluggable.getProviderName() === providerName) {
                pluggable.removeCredentials();
            }
        });
    }

    public getCredentials(config) {
        const { providerName } = config;
        this._pluggables.map((pluggable) => {
            if (pluggable.getProviderName() === providerName) {
                return pluggable.getCredentials(config);
            }
        });
    }
}
