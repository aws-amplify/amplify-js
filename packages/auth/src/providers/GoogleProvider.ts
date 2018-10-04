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
        const { _keyPrefix } = this._config;
        const { username, attributes, tokens, errorHandler } = params;
        
        const session: FederatedProviderSession = {
            idToken: tokens.idToken,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expires_at: tokens.expires_at,
            type: 'FederatedProviderSession',
            provider: this.getProviderName()
        }

        const user: FederatedUser = {
            name: username,
            attributes
        }
        
        // cache information
        await this._storageSync;
        const sessionSourceKey = `${_keyPrefix}_sessionSource`;
        const sessionKey = `${_keyPrefix}_session`;
        const userKey = `${_keyPrefix}_user`;
        const credentialsKey = `${_keyPrefix}_credentials`;

        this._storage.setItem(sessionSourceKey, this.getProviderName());
        this._storage.setItem(sessionKey, JSON.stringify(session));
        this._storage.setItem(userKey, JSON.stringify(user));

        let credentials = undefined;
        try {
            credentials = await Credentials.set({
                provider: 'google', 
                token: tokens.idToken, 
                identity_id: attributes? attributes['identity_id']: undefined
            }, 'federation');
            user.id = credentials.identityId;
            this._storage.setItem(credentialsKey, JSON.stringify(credentials));
        } catch (e) {
            logger.debug('Failed to get the aws credentials with the tokens provided', e);
            if (errorHandler) {
                errorHandler(e);
            }
        }
        
        return {
            session,
            user,
            credentials
        }
    }

    public async getSession(): Promise<any> {
        // refresh to be implemented, also considering offline

        const { _keyPrefix } = this._config;
        await this._storageSync;
        return JSON.parse(this._storage.getItem(`${_keyPrefix}_session`));
    }

    public async clearSession(): Promise<void> {
        const { _keyPrefix } = this._config;
        const sessionSourceKey = `${_keyPrefix}_sessionSource`;
        const sessionKey = `${_keyPrefix}_session`;
        const userKey = `${_keyPrefix}_user`;

        this._storage.removeItem(sessionSourceKey);
        this._storage.removeItem(sessionKey);
        this._storage.removeItem(userKey);
    }

    public async getUser(): Promise<any> {
        const { _keyPrefix } = this._config;
        await this._storageSync;
        return JSON.parse(this._storage.getItem(`${_keyPrefix}_user`));
    }

    public async getCredentials(): Promise<any> {
        // refresh to be implemented also considering offline
        

        const { _keyPrefix } = this._config;
        await this._storageSync;
        return JSON.parse(this._storage.getItem(`${_keyPrefix}_credentials`));
    }
}
