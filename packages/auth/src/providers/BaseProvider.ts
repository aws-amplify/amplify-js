import { AuthProvider, ExternalSession, SetSessionResult, FederatedProviderSession, FederatedUser } from '../types';
import { Credentials, ConsoleLogger as Logger } from '@aws-amplify/core';

const logger = new Logger('BaseProvider');

export default class BaseProvider implements AuthProvider {
    protected _config;
    protected _storage;
    protected _storageSync;
    protected _userPool;
    protected _keyPrefix;
    protected _refreshHandler;
    protected _credentialsDomain;

    constructor(options?) {
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
        return 'Base';
    }

    public getCategory() {
        return 'Auth'
    }

    public async setSession(params: ExternalSession): Promise<SetSessionResult> {
        const { _keyPrefix } = this._config;
        const { username, attributes, tokens, errorHandler, identityId, credentialsDomain } = params;
        this._credentialsDomain = credentialsDomain;

        const session: FederatedProviderSession = {
            idToken: tokens.idToken,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expires_at: tokens.expires_at,
            type: 'FederatedProviderSession',
            provider: this.getProviderName(),
            identityId,
            credentialsDomain
        }

        const user: FederatedUser = {
            name: username,
            attributes
        }
        
        // cache information
        await this._storageSync;
        const sessionKey = `${_keyPrefix}_session`;
        const userKey = `${_keyPrefix}_user`;
        const credentialsKey = `${_keyPrefix}_credentials`;

        this._storage.setItem(sessionKey, JSON.stringify(session));
        this._storage.setItem(userKey, JSON.stringify(user));

        let credentials = undefined;
        try {
            credentials = await Credentials.set({
                domain: this._credentialsDomain, 
                token: tokens.idToken, 
                identity_id: identityId
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
        const { _keyPrefix } = this._config;
        await this._storageSync;
        try {
            const session : FederatedProviderSession = JSON.parse(this._storage.getItem(`${_keyPrefix}_session`));
            if (!session) throw new Error('Session is not cached.');
            const { expires_at, idToken, ...otherSessionInfo } = session;
            if (expires_at > new Date().getTime()) {
                logger.debug('token not expired');
                return session;
            } else {
                // refresh
                if (this._refreshHandler && typeof this._refreshHandler === 'function') {
                    logger.debug('getting refreshed jwt token from federation provider');
                    return this._refreshHandler().then((data) => {
                        logger.debug('refresh federated token sucessfully', data);
                        const session: FederatedProviderSession = {
                            idToken: data.token,
                            expires_at: data.expired,
                            ...otherSessionInfo
                        };
                    
                        return session;
                    }).catch(e => {
                        logger.debug('refresh federated token failed', e);
                        throw('refreshing federation token failed: ' + e);
                    });
                } else {
                    logger.debug('no refresh handler for provider:', this.getProviderName());
                    throw('no refresh handler for provider');
                }
            }
        } catch (e) {
            throw e;
        }
    }

    public async clearSession(): Promise<void> {
        const { _keyPrefix } = this._config;
        const sessionKey = `${_keyPrefix}_session`;
        const userKey = `${_keyPrefix}_user`;

        this._storage.removeItem(sessionKey);
        this._storage.removeItem(userKey);
    }

    public async getUser(): Promise<any> {
        const { _keyPrefix } = this._config;
        await this._storageSync;
        return JSON.parse(this._storage.getItem(`${_keyPrefix}_user`));
    }
}
