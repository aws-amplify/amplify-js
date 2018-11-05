import { 
    AuthProvider, 
    ExternalSession, 
    SetSessionResult, 
    FederatedProviderSession, 
    FederatedUser, 
    SessionType 
} from '../types';
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
        if (options) this.configure(options);
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
        const { username, attributes, tokens, errorHandler, identityId, credentialsDomain } = params;
        this._credentialsDomain = credentialsDomain || this._credentialsDomain;

        const session: FederatedProviderSession = {
            idToken: tokens.idToken,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expires_at: tokens.expires_at,
            type: SessionType.Federated_Provider_Session,
            provider: this.getProviderName(),
            identityId,
            credentialsDomain: this._credentialsDomain,
            credentialsToken: tokens.idToken
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
        if (!session) throw new Error('session is not cached.');
        const { expires_at, idToken, credentialsToken, ...otherSessionInfo } = session;
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
                        expires_at: data.expires_at,
                        credentialsToken: data.token,
                        ...otherSessionInfo
                    };
                
                    return session;
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
    }

    public async getUser(): Promise<any> {
        const { _keyPrefix } = this._config;
        await this._storageSync;
        return JSON.parse(this._storage.getItem(`${_keyPrefix}_user`));
    }
}
