import { 
    AuthProvider, 
    ExternalSession, 
    SetSessionResult, 
    FederatedProviderSession, 
    FederatedUser, 
    SessionType 
} from '../types';
import { Credentials, ConsoleLogger as Logger } from '@aws-amplify/core';
import Cache from '@aws-amplify/cache';

const logger = new Logger('BaseProvider');

export default class BaseProvider implements AuthProvider {
    static ACCESS_TOKEN = 'access_token';
    static ID_TOKEN = 'id_token';

    protected _config;
    protected _storage;
    protected _storageSync;
    protected _userPool;
    protected _keyPrefix;
    protected _refreshHandler;
    protected _credentialsDomain;
    protected _credentialsTokenSource;

    constructor(options?) {
        this._config = {};
        if (options) this.configure(options);
        this._credentialsTokenSource = BaseProvider.ID_TOKEN;
    }

    public configure(options) {
        Object.assign(this._config, options);
        const { storage, refreshHandlers = {} } = this._config;
        this._storage = storage;
        this._storageSync = this._storage && typeof this._storage['sync'] === 'function'? 
            this._storage['sync']() : Promise.resolve();

        this._refreshHandler = 
            refreshHandlers[this.getProviderName()] || 
            refreshHandlers[this._credentialsDomain];
    }

    public getProviderName() {
        return 'Base';
    }

    public getCategory() {
        return 'Auth';
    }

    public async setSession(params: ExternalSession): Promise<SetSessionResult> {
        const { _keyPrefix } = this._config;
        const { 
            username, 
            attributes, 
            tokens, 
            expires_at,
            provider,
            federatedWithIDP={}
        } = params;

        federatedWithIDP.domain = federatedWithIDP.domain || this._credentialsDomain;
        federatedWithIDP.token = federatedWithIDP.token || this._credentialsTokenSource || BaseProvider.ID_TOKEN;

        const { errorHandler, ...otherProps} = federatedWithIDP;

        const session: FederatedProviderSession = {
            tokens,
            expires_at,
            type: SessionType.FederatedProviderSession,
            provider: this.getProviderName(),
            federatedWithIDP: otherProps
        };

        const user: FederatedUser = {
            name: username,
            attributes
        };
        
        // cache information
        await this._storageSync;
        const sessionKey = `${_keyPrefix}_session`;
        const userKey = `${_keyPrefix}_user`;

        this._storage.setItem(sessionKey, JSON.stringify(session));
        this._storage.setItem(userKey, JSON.stringify(user));

        let credentials = undefined;
        try {
            credentials = await Credentials.set(session, 'federation');
            user.id = credentials.identityId;
            this._storage.setItem(userKey, JSON.stringify(user));
             // backward compatibility
            Cache.setItem(
                'federatedInfo', 
                { 
                    provider, 
                    token: federatedWithIDP.token === 'id_token'? tokens.idToken: tokens.accessToken,
                    user, 
                    expires_at, 
                    identity_id: federatedWithIDP.identityId 
                }, 
                { priority: 1 }
            );
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
        };
    }

    public async getSession(): Promise<any> {
        const { _keyPrefix } = this._config;
        await this._storageSync;

        const session : FederatedProviderSession = JSON.parse(this._storage.getItem(`${_keyPrefix}_session`));
        if (!session) throw new Error('Session is not cached.');
        if (session.expires_at > new Date().getTime()) {
            logger.debug('token not expired');
            return session;
        } else {
            // refresh
            if (this._refreshHandler && typeof this._refreshHandler === 'function') {
                logger.debug('getting refreshed jwt token from federation provider');
                return this._refreshHandler().then((data) => {
                    logger.debug('refresh federated token sucessfully', data);
                    let newSession : FederatedProviderSession = null;
                    const { expires_at, tokens, ...otherSessionInfo } = session;
                    if (this._credentialsTokenSource === BaseProvider.ACCESS_TOKEN) {
                        tokens.accessToken = data.token;
                    } else {
                        tokens.idToken = data.token;
                    }
                    newSession = {
                        tokens,
                        expires_at: data.expires_at,
                        ...otherSessionInfo
                    };
                    // restore the new session
                    this._storage.setItem(`${_keyPrefix}_session`, JSON.stringify(newSession));
                    return newSession;
                }).catch(e => {
                    logger.debug('refresh federated token failed', e);
                    throw new Error('refreshing federation token failed: ' + e);
                });
            } else {
                logger.debug('no refresh handler for provider:', this.getProviderName());
                throw new Error('no refresh handler for provider');
            }
        }
    }

    public async clearSession(): Promise<void> {
        const { _keyPrefix } = this._config;
        const sessionKey = `${_keyPrefix}_session`;
        const userKey = `${_keyPrefix}_user`;

        this._storage.removeItem(sessionKey);
        this._storage.removeItem(userKey);
        Cache.removeItem('federatedInfo');
    }

    public async getUser(): Promise<any> {
        const { _keyPrefix } = this._config;
        await this._storageSync;
        return JSON.parse(this._storage.getItem(`${_keyPrefix}_user`));
    }
}
