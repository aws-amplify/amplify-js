import {
    AWS,
    Cognito,
    ConsoleLogger as Logger,
    Constants,
    Hub
} from '../Common';

import CognitoAuth from './CognitoAuth';
import Credentials from '../Credentials';

const dispatchAuthEvent = (event, data) => {
    Hub.dispatch('auth', { event, data }, 'Auth');
};

const logger = new Logger('Auth');

export default class Auth {
    private _config;
    private _pluggables;

    constructor() {
        this._config = {};
        this._pluggables = [];
        
        this._pluggables.push(new CognitoAuth());
    }

    public configure(config) {
        logger.debug('configure Auth');

        // will be moved into Parser
        const amplifyConfig = {};
        if (config['aws_cognito_identity_pool_id']) {
            const authConfig = {};
            authConfig['cognitoIdentityPoolId'] = config['aws_cognito_identity_pool_id'];
            authConfig['cognitoRegion'] = config['aws_cognito_region'];
            authConfig['cognitoUserPoolId'] = config['aws_user_pools_id'];
            authConfig['cognitoUserPoolWebClientId'] = config['aws_user_pools_web_client_id'];
            amplifyConfig['Auth'] = authConfig;
        }
        amplifyConfig['Auth'] = Object.assign({}, amplifyConfig['Auth'], config.Auth);

        const conf = Object.assign({}, this._config, amplifyConfig['Auth']);
        this._config = conf;
        this._pluggables.map((pluggable) => {
            pluggable.configure(conf);
        }); 
    }

    public addPluggable(pluggable) {

    }

    /**
     * Sign in
     * @param {String} username - The username to be signed in 
     * @param {String} password - The password of the username
     * @return - A promise resolves the CognitoUser object if success or mfa required
     */
    public signIn(username: string, password: string, options?: object): Promise<any> {
        const params = Object.assign(
            {}, 
            { 
                username, 
                password, 
                providerName: 'AWSCognito', 
                credHandler: Credentials 
            }, 
            options);
        const providerName = params.providerName;

        this._pluggables.map((pluggable) => {
            if (pluggable.getProviderName() === providerName) {
                return new Promise((res, rej) => {
                    pluggable.signIn(params)
                        .then((ret) => {
                            const {user, session} = ret;
                            logger.debug('sign in successfully with user', user);
                            if (session) {
                                logger.debug('setting up credentials from session');
                                Credentials.setCredentils({ session, providerName });
                            }
                            res(user);
                        }).catch(err => {
                            logger.debug('sign in failed');
                            rej(err);
                        });
                });
            }
        });

        return Promise.reject(new Error('no provider selected for sign in'));
    }
}