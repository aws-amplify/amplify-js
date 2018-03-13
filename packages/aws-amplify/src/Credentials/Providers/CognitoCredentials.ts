import {
    AWS,
    Cognito,
    ConsoleLogger as Logger,
    Constants,
    Hub
} from '../../Common';

import Auth from '../../Auth'; 
import Cache from '../../Cache';
const {
    CognitoIdentityCredentials
} = AWS;

const logger = new Logger('CognitoCredentials');

export default class CognitoCredentials {
    private _credentials;
    private credentials_source = ''; // aws, guest, userPool, federated
    private _config;

    constructor(config?) {
        this._config = config? config: {};
        this._credentials = null;
    }

    /**
     * pass the configuration
     * @param config 
     */
    public configure(config) {
        logger.debug('configure CognitoCredentials with config', config);
        const conf= config? config: {};
        this._config = Object.assign({}, this._config, conf);
        return this._config;
    }

    /**
     * Get the category of this provider
     */
    public getCategory() {
        return 'Credentials';
    }

    /**
     * Get the name of this provider
     */
    public getProviderName() {
        return 'AWSCognito';
    }

    /**
     * Set the credentials with configuration
     * @param config - the configuration to set the credentials
     */
    public setCredentials(config) {
        const { session, guest, federated } = config;
        
        if (session) {
            return this._setCredentialsFromSession(session);
        } else if (guest) {
            return this._setCredentialsForGuest();
        } else if (federated) {
            return this._setCredentialsFromFederation(federated);
        } else {
            logger.debug('incorrect configuration for credentials', config);
            return Promise.reject('incorrect configuration for credentials');
        }
    }

    /**
     * Remove the credential from library
     */
    public removeCredentials() {
        if (this._credentials) this._credentials.clearCachedId();
        Cache.removeItem('federatedInfo');
        this._credentials = null;
        this.credentials_source = '';
    }

    /**
     * Get authenticated credentials of current user.
     * @return - A promise resolves to be current user's credentials
     */
    public getCredentials(config?): Promise<any> {
        logger.debug('getting credentials with config', config);
        if (this._credentials && !this._isExpired(this._credentials)) {
            logger.debug('credentails exists and not expired');
            return Promise.resolve(this._credentials);
        } else {
            const that = this;
            return this._retrieveCredentialsFromAuth()
                .then(() => {
                    const credentials = that._credentials;
                    return that._refreshCredentials(credentials);
                })
                .catch(() => {
                    return Promise.resolve(null);
                });
        } 
    }

    /**
     * Compact version of credentials
     * @param {Object} credentials
     * @return {Object} - Credentials
     */
    public essentialCredentials(params) {
        logger.debug('essential credentials');
        const { credentials } = params;
        return {
            accessKeyId: credentials.accessKeyId,
            sessionToken: credentials.sessionToken,
            secretAccessKey: credentials.secretAccessKey,
            identityId: credentials.identityId,
            authenticated: credentials.authenticated
        };
    }

    private async _retrieveCredentialsFromAuth() : Promise<any> {
        try {
            logger.debug('getting credentials from cognito auth');
            const federatedInfo = await Cache.getItem('federatedInfo');
            if (federatedInfo) {
                const { provider, token, user} = federatedInfo;
                return new Promise((resolve, reject) => {
                    this._setCredentialsFromFederation({ provider, token, user });
                    resolve();
                });
            } else {
                const that = this;
                return Auth.currentSession()
                    .then(session => that._setCredentialsFromSession(session))
                    .catch((error) => that._setCredentialsForGuest());
            }
        } catch (e) {
            return Promise.reject(e);
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

    private _refreshCredentials(credentials): Promise<any> {
        logger.debug('try to refresh credentials', credentials);
        const cred = credentials || this._credentials;
        if (!cred) {
            return Promise.reject(new Error('no credentials provided for refreshing!'));
        }
        return new Promise((resolve,reject) => {
            cred.refresh(err => {
                if (err) {
                    logger.debug('refresh credentials error', err);
                    resolve(null);
                } else {
                    resolve(cred);
                }
            });
        });
    }

    private _setCredentialsForGuest() {
        logger.debug('set credentials from guest with config', this._config);
        const { cognitoIdentityPoolId, cognitoRegion, mandatorySignIn } = this._config;
        if (mandatorySignIn) {
            logger.debug('mandatory sign in, no guest credentials provided');
            this._credentials = null;
            this.credentials_source = 'no credentials';
            return;
        }

        const credentials = new CognitoIdentityCredentials(
            {
            IdentityPoolId: cognitoIdentityPoolId
        },  {
            region: cognitoRegion
        });
        credentials.params['IdentityId'] = null; // Cognito load IdentityId from local cache
        this._credentials = credentials;
        this._credentials.authenticated = false;
        this.credentials_source = 'guest';

        return Promise.resolve(this._credentials);
    }
    
    private _setCredentialsFromSession(session) {
        logger.debug('set credentials from session');
        const idToken = session.getIdToken().getJwtToken();
        const { cognitoRegion, cognitoUserPoolId, cognitoIdentityPoolId } = this._config;
        const key = 'cognito-idp.' + cognitoRegion + '.amazonaws.com/' + cognitoUserPoolId;
        const logins = {};
        logins[key] = idToken;
        this._credentials = new CognitoIdentityCredentials(
            {
            IdentityPoolId: cognitoIdentityPoolId,
            Logins: logins
        },  {
            region: cognitoRegion
        });
        this._credentials.authenticated = true;
        this.credentials_source = 'userPool';

        return Promise.resolve(this._credentials);
    }

    private _setCredentialsFromFederation(federated) {
        logger.debug('set credentials from federation');
        const { provider, token, user } = federated;
        const domains = {
            'google': 'accounts.google.com',
            'facebook': 'graph.facebook.com',
            'amazon': 'www.amazon.com',
            'developer': 'cognito-identity.amazonaws.com'
        };

        Cache.setItem('federatedInfo', { provider, token, user }, { priority: 1 });

        const domain = domains[provider];
        if (!domain) {
            return Promise.reject(provider + ' is not supported: [google, facebook, amazon]');
        }

        const logins = {};
        logins[domain] = token;

        const { cognitoIdentityPoolId, cognitoRegion } = this._config;
        this._credentials = new AWS.CognitoIdentityCredentials(
            {
            IdentityPoolId: cognitoIdentityPoolId,
            Logins: logins
        },  {
            region: cognitoRegion
        });
        this._credentials.authenticated = true;
        this.credentials_source = 'federated';

        if (AWS && AWS.config) { AWS.config.credentials = this._credentials; }

        return Promise.resolve(this._credentials);
    }
}
