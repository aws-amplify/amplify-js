import { AuthProvider, ExternalSession, SetSessionResult, FederatedProviderSession, FederatedUser } from '../types';
import { Credentials, ConsoleLogger as Logger, FacebookOAuth } from '@aws-amplify/core';
import BaseProvider from './BaseProvider';

const logger = new Logger('FacebookProvider');

export default class FacebookProvider extends BaseProvider implements AuthProvider {
    constructor(options?) {
        super(options);
        this._credentialsDomain = 'graph.facebook.com';
    }

    public configure(options) {
        super.configure(options);
        const { refreshHandlers = {} } = this._config;

        this._refreshHandler = 
            refreshHandlers['facebook'] || 
            refreshHandlers[this.getProviderName()] || 
            FacebookOAuth.refreshFacebookToken;
    }

    public getProviderName() {
        return 'Facebook';
    } 

    public async setSession(params: ExternalSession): Promise<SetSessionResult> {
        const { _keyPrefix } = this._config;
        const { username, attributes, tokens, errorHandler, identityId } = params;
        
        const session: FederatedProviderSession = {
            idToken: tokens.idToken,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expires_at: tokens.expires_at,
            type: 'FederatedProviderSession',
            provider: this.getProviderName(),
            identityId
        }

        const user: FederatedUser = {
            name: username,
            attributes
        }
        
        // cache information
        await this._storageSync;
        const sessionKey = `${_keyPrefix}_session`;
        const userKey = `${_keyPrefix}_user`;

        this._storage.setItem(sessionKey, JSON.stringify(session));
        this._storage.setItem(userKey, JSON.stringify(user));

        let credentials = undefined;
        try {
            credentials = await Credentials.set({
                domain: this._credentialsDomain, 
                token: tokens.accessToken, 
                identity_id: identityId
            }, 'federation');
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
        }
    }

    public async getSession(): Promise<any> {
        const { _keyPrefix } = this._config;
        await this._storageSync;
        try {
            const session : FederatedProviderSession = JSON.parse(this._storage.getItem(`${_keyPrefix}_session`));
            if (!session) throw new Error('Session is not cached.');
            const { expires_at, accessToken, ...otherSessionInfo } = session;
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
                            accessToken: data.token,
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
}
