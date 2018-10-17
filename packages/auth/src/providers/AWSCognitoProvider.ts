import { AuthProvider, ExternalSession, SetSessionResult } from '../types';
import { CognitoUser, CognitoUserPool, CognitoUserSession, CognitoIdToken, CognitoAccessToken, CognitoRefreshToken } from 'amazon-cognito-identity-js';
import { Credentials, ConsoleLogger as Logger } from '@aws-amplify/core';

const logger = new Logger('AWSCognitoProvider');

export default class AWSCognitoProvider implements AuthProvider {
    private _config;
    private _storage;
    private _storageSync;
    private _userPool;
    private _keyPrefix;

    constructor(options?) {
        this._config = {};

        if (options) this.configure(options);
    }


    public configure(options) {
        Object.assign(this._config, options);
        const { userPoolId, userPoolWebClientId, storage } = this._config;
        this._storage = storage;
        this._storageSync = this._storage && typeof this._storage['sync'] === 'function'? 
            this._storage['sync']() : Promise.resolve();

        if (userPoolId) {
            this._userPool = new CognitoUserPool({
                UserPoolId: userPoolId,
                ClientId: userPoolWebClientId
            });
        }
    }

    public getProviderName() {
        return 'AWSCognito';
    }

    public getCategory() {
        return 'Auth'
    }

    public async setSession(params: ExternalSession): Promise<SetSessionResult> {
        const { authenticationFlowType, _keyPrefix } = this._config;
        const { username, tokens, provider, errorHandler } = params;

        const user = new CognitoUser({
            Username: username,
            Pool: this._userPool,
            Storage: this._storage
        });

        const userSession = new CognitoUserSession({
            IdToken: new CognitoIdToken({IdToken: tokens.idToken}),
            AccessToken: new CognitoAccessToken({AccessToken: tokens.accessToken}),
            RefreshToken: new CognitoRefreshToken({RefreshToken: tokens.refreshToken})
        });

        // cache information
        user.setSignInUserSession(userSession);
        this._storageSync.then(() => {
            this._storage.setItem(`${_keyPrefix}_sessionSource`, this.getProviderName());
        });

        let credentials = undefined;
        try {
            credentials = await Credentials.set(userSession, 'session');
        } catch (e) {
            logger.debug('Failed to get the aws credentials with the tokens provided', e);
            if (errorHandler) {
                errorHandler(e);
            }
        }
        
        return {
            session: Object.assign(userSession, { type: 'CognitoUserSession' }) ,
            user,
            credentials
        }
    }

    public async getSession(): Promise<any> {
        logger.debug('tobe implemented');
        return null;
    }

    public async clearSession(): Promise<void> {
        logger.debug('tobe implemented');
        return;
    }

    public async getUser(): Promise<any> {
        logger.debug('tobe implemented');
        return;
    }
}