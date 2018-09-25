import { AuthProvider, ExternalSession, SetSessionResult, FederatedProviderSession, FederatedUser } from '../types';
import { CognitoUser, CognitoUserPool, CognitoUserSession, CognitoIdToken, CognitoAccessToken, CognitoRefreshToken } from 'amazon-cognito-identity-js';
import { Credentials, ConsoleLogger as Logger } from '@aws-amplify/core';

const logger = new Logger('GoogleProvider');

export default class GoogleProvider implements AuthProvider {
    private _config;
    private _storage;
    private _storageSync;
    private _userPool;
    private _keyPrefix;

    constructor(options) {
        this._config = {};

        this.configure(options);
    }

    public configure(options) {
        Object.assign(this._config, options);
        const { storage } = this._config;
        this._storage = storage;
        this._storageSync = Promise.resolve();
        if (typeof this._storage['sync'] === 'function') {
            this._storageSync = this._storage['sync']();
        }
    }

    public getProviderName() {
        return 'Google';
    }

    public getCategory() {
        return 'Auth'
    }

    public async setSession(params: ExternalSession): Promise<SetSessionResult> {
        const { oauth, _keyPrefix } = this._config;
        const { username, attributes, tokens } = params;

        // if oauth
        // .....
        
        const session: FederatedProviderSession = {
            idToken: tokens.idToken,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expires_at: tokens.expires_at,
            type: 'FederatedProviderSession'
        }

        const user: FederatedUser = {
            name: username,
            attributes
        }
        
        let credentials = undefined;
        try {
            credentials = await Credentials.set({
                provider: 'google', 
                token: tokens.idToken, 
                identity_id: attributes? attributes['identity_id']: undefined
            }, 'federation');
            user.id = credentials.identityId;
        } catch (e) {
            logger.debug('Failed to get the aws credentials with the tokens provided', e);
        }

        // cache information
        this._storageSync.then(() => {
            this._storage.setItem(`${_keyPrefix}_sessionSource`, this.getProviderName());
        });
        this._cacheInfo(session, user);
        
        return {
            session,
            user,
            credentials
        }
    }

    private _cacheInfo(session, user) {
        const { _keyPrefix } = this._config;
        const sessionKey = `${_keyPrefix}_session`;
        const userKey = `${_keyPrefix}_user`;

        this._storage.setItem(sessionKey, JSON.stringify(session));
        this._storage.setItem(userKey, JSON.stringify(user));
    }

    public async getSession(): Promise<any> {
        logger.debug('tobe implemented');
        return null;
    }

    public async clearSession(): Promise<void> {
        logger.debug('tobe implemented');
        return;
    }
}