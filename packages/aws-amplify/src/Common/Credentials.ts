import { ConsoleLogger as Logger } from './Logger';
import StorageHelper from './StorageHelper';
import { AWS } from './Facet';
import JS from './JS';
import Platform from './Platform';
import { FacebookOAuth, GoogleOAuth } from './OAuthHelper';

const logger = new Logger('Credentials');

export class Credentials {
    private _config;
    private _credentials;
    private _credentials_source;
    private _gettingCredPromise = null;
    private _authClass = null;
    private _cacheClass = null;
    private _refreshHandlers = {};

    constructor(config) {
        this.configure(config);
        this._refreshHandlers['google'] = GoogleOAuth.refreshGoogleToken;
        this._refreshHandlers['facebook'] = FacebookOAuth.refreshFacebookToken;
    }

    public setAuthClass(auth) {
        this._authClass = auth;
    }

    public setCacheClass(cache) {
        this._cacheClass = cache;
    }

    public getCredSource() {
        return this._credentials_source;
    }

    public configure(config){
        if (!config) return this._config || {};

        this._config = Object.assign({}, this._config, config);
        const { refreshHandlers } = this._config;
         // If the developer has provided an object of refresh handlers,
        // then we can merge the provided handlers with the current handlers.
        if (refreshHandlers) {
            this._refreshHandlers = { ...this._refreshHandlers,  ...refreshHandlers };
        }

        return this._config;
    }

    public get() {
        logger.debug('getting credentials');
        return this._pickupCredentials();
    }

    private _pickupCredentials() {
        logger.debug('picking up credentials');
        if (!this._gettingCredPromise || !this._gettingCredPromise.isPending()) {
            logger.debug('getting new cred promise');
            if (AWS.config && AWS.config.credentials && AWS.config.credentials instanceof Credentials) {
                this._gettingCredPromise = JS.makeQuerablePromise(this._setCredentialsFromAWS());
            } else {
                this._gettingCredPromise = JS.makeQuerablePromise(this._keepAlive());
            }
        } else {
            logger.debug('getting old cred promise');
        }

        return this._gettingCredPromise;
    }

    private _keepAlive() {
        logger.debug('checking if credentials exists and not expired');
        const cred = this._credentials;
        if (cred && !this._isExpired(cred)) {
            logger.debug('credentials not changed and not expired, directly return');
            return Promise.resolve(cred);
        }

        logger.debug('need to get a new credential or refresh the existing one');
        return this._authClass.currentUserCredentials();
    }

    public refreshFederatedToken(federatedInfo) {
        logger.debug('Getting federated credentials');
        const { provider, user } = federatedInfo;
        let token = federatedInfo.token;
        let expires_at = federatedInfo.expires_at;
        let identity_id = federatedInfo.identity_id;

        const that = this;
        logger.debug('checking if federated jwt token expired');
        if (expires_at > new Date().getTime()) {
            // if not expired
            logger.debug('token not expired');
            return this._setCredentialsFromFederation({provider, token, user, identity_id, expires_at });
        } else {
            // if refresh handler exists
            if (that._refreshHandlers[provider] && typeof that._refreshHandlers[provider] === 'function') {
                logger.debug('getting refreshed jwt token from federation provider');
                return that._refreshHandlers[provider]().then((data) => {
                    logger.debug('refresh federated token sucessfully', data);
                    token = data.token;
                    identity_id = data.identity_id;
                    expires_at = data.expires_at;
                    
                    return that._setCredentialsFromFederation({ provider, token, user, identity_id, expires_at });
                }).catch(e => {
                    logger.debug('refresh federated token failed', e);
                    this.clear();
                    return Promise.reject('refreshing federation token failed: ' + e);
                });
            } else {
                logger.debug('no refresh handler for provider:', provider);
                this.clear();
                return Promise.reject('no refresh handler for provider');
            }
        }
    }

    private _isExpired(credentials): boolean {
        if (!credentials) {
            logger.debug('no credentials for expiration check');
            return true;
        }
        logger.debug('is this credentials expired?', credentials);
        const ts = new Date().getTime();
        const delta = 10 * 60 * 1000; // 10 minutes
        const { expired, expireTime } = credentials;
        if (!expired && expireTime > ts + delta) {
            return false;
        }
        return true;
    }

    private async _setCredentialsForGuest() {
        logger.debug('setting credentials for guest');
        const { identityPoolId, region, mandatorySignIn } = this._config;
        if (mandatorySignIn) {
            return Promise.reject('cannot get guest credentials when mandatory signin enabled');
        }

        const identityId = await StorageHelper.getItem('CognitoIdentityId-' + identityPoolId);
        const credentials = new AWS.CognitoIdentityCredentials(
            {
            IdentityPoolId: identityPoolId,
            IdentityId: identityId? identityId: undefined
        },  {
            region
        });

        const that = this;
        return this._loadCredentials(credentials, 'guest', false, null);
    }

    private _setCredentialsFromAWS() {
        const credentials = AWS.config.credentials;
        logger.debug('setting credentials from aws');
        const that = this;
        if (credentials instanceof AWS.Credentials){
            return this._loadCredentials(credentials, 'aws', undefined, null);
        } else {
            logger.debug('AWS.config.credentials is not an instance of AWS Credentials');
            return Promise.reject('AWS.config.credentials is not an instance of AWS Credentials');
        }
    }

    private _setCredentialsFromFederation(params) {
        const { provider, token, identity_id, user, expires_at } = params;
        const domains = {
            'google': 'accounts.google.com',
            'facebook': 'graph.facebook.com',
            'amazon': 'www.amazon.com',
            'developer': 'cognito-identity.amazonaws.com'
        };

        // Use custom provider url instead of the predefined ones
        const domain = domains[provider] || provider;
        if (!domain) {
            return Promise.reject('You must specify a federated provider');
        }

        const logins = {};
        logins[domain] = token;

        const { identityPoolId, region } = this._config;
        const credentials = new AWS.CognitoIdentityCredentials(
            {
            IdentityPoolId: identityPoolId,
            IdentityId: identity_id,
            Logins: logins
        },  {
            region
        });

        return this._loadCredentials(
            credentials, 
            'federated', 
            true, 
            params,
        );
    }

    private _setCredentialsFromSession(session) {
        logger.debug('set credentials from session');
        const idToken = session.getIdToken().getJwtToken();
        const { region, userPoolId, identityPoolId } = this._config;
        const key = 'cognito-idp.' + region + '.amazonaws.com/' + userPoolId;
        const logins = {};
        logins[key] = idToken;
        const credentials = new AWS.CognitoIdentityCredentials(
            {
            IdentityPoolId: identityPoolId,
            Logins: logins
        },  {
            region
        });

        const that = this;
        return this._loadCredentials(credentials, 'userPool', true, null);
    }

    private _loadCredentials(credentials, source, authenticated, info) {
        const that = this;
        const { identityPoolId } = this._config;
        return new Promise((res, rej) => {
            credentials.getPromise().then(
                async () => {
                    logger.debug('Load credentials successfully', credentials);
                    that._credentials = credentials;
                    that._credentials.authenticated = authenticated;
                    that._credentials_source = source;
                    if (source === 'federated') {
                        const user = Object.assign(
                            { id: this._credentials.identityId },
                            info.user
                        );
                        const { provider, token, expires_at, identity_id } = info;
                        this._cacheClass.setItem(
                            'federatedInfo', 
                            { 
                                provider, 
                                token, 
                                user, 
                                expires_at, 
                                identity_id 
                            }, 
                            { priority: 1 }
                        );
                    }
                    if (source === 'guest') {
                        try {
                            await StorageHelper.setItem(
                                'CognitoIdentityId-' + identityPoolId, 
                                credentials.identityId
                            );
                        } catch (e) {
                            logger.debug('Failed to cache identityId', e);
                        }
                    }
                    res(that._credentials);
                },
                (err) => {
                    logger.debug('Failed to load credentials', credentials);
                    rej(err);
                }
            );
        });
    }

    public set(params, source) {
        if (source === 'session') {
            return this._setCredentialsFromSession(params);
        } else if (source === 'federation') {
            return this._setCredentialsFromFederation(params);
        } else if (source === 'guest') {
            return this._setCredentialsForGuest();
        } else {
            logger.debug('no source specified for setting credentials');
            return Promise.reject('invalid source');
        }
    }

    public async clear() {
        const { identityPoolId, region } = this._config;
        if (identityPoolId) {
            // work around for cognito js sdk to ensure clearCacheId works
            const credentials = new AWS.CognitoIdentityCredentials(
                {
                IdentityPoolId: identityPoolId
            },  {
                region
            });
            credentials.clearCachedId();
        }
        this._credentials = null;
        this._credentials_source = null;
        await this._cacheClass.removeItem('federatedInfo');
    }
}

const instance = new Credentials(null);

export default instance;
