import {
    AWS,
    Cognito,
    ConsoleLogger as Logger,
    Constants,
    Hub
} from '../Common';

import Auth from '../Auth'; 
const {
    CognitoIdentityCredentials
} = AWS;

const logger = new Logger('Credentials');

export default class CognitoCredentials {
    private _credentials;
    private credentials_source = ''; // aws, guest, userPool, federated
    private _config;

    constructor(config?) {
        this._config = config? config: {};
        this._credentials = null;
    }

    configure(config) {
        logger.debug('configure CognitoCredentials');
        const conf= config? config: {};
        this._config = Object.assign({}, this._config, conf);
        return this._config;
    }

    getCategory() {
        return 'Credentials';
    }

    getProviderName() {
        return 'AWSCognito';
    }

    setCredentials(config) {
        const { session, guest } = config;
        
        if (!session) {
            this.setCredentialsFromSession(session);
        }
        if (!guest) {
            this.setCredentialsForGuest();
        }
    }

    removeCredentials() {
        this._credentials.clearCachedId();
    }

    refreshCredentials(credentials): Promise<any> {
        const cred = credentials || this._credentials;
        if (!cred) {
            return Promise.reject(new Error('no credentials provided for refreshing!'));
        }
        return new Promise((resolve,reject) => {
            cred.refresh(err => {
                logger.debug('changed from previous');
                if (err) {
                    logger.debug('refresh credentials error', err);
                    resolve(null);
                } else {
                    resolve(cred);
                }
            });
        });
    }

    isExpired(credentials): boolean {
        if (!credentials) {
            logger.debug('no credentials for expiration check')
            return true;
        }
        const ts = new Date().getTime();
        const delta = 10 * 60 * 1000; // 10 minutes
        const { expired, expireTime } = credentials;
        if (!expired && expireTime > ts + delta) {
            return false;
        }
        return true;
    }

    /**
     * Get authenticated credentials of current user.
     * @return - A promise resolves to be current user's credentials
     */
    public retrieveCredentialsFromAuth() : Promise<any> {
        const that = this;
        return Auth.currentSession()
            .then(session => that.setCredentialsFromSession(session))
            .catch((error) => that.setCredentialsForGuest());
    }

    public getCredentials(): Promise<any> {
        if (this._credentials && !this.isExpired(this._credentials)) {
            return this.refreshCredentials(this._credentials);
        }
        else{
            const that = this;
            return this.retrieveCredentialsFromAuth()
                .then(() => {
                    const credentials = that._credentials;
                    return that.refreshCredentials(credentials);
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
    public essentialCredentials(credentials) {
        return {
            accessKeyId: credentials.accessKeyId,
            sessionToken: credentials.sessionToken,
            secretAccessKey: credentials.secretAccessKey,
            identityId: credentials.identityId,
            authenticated: credentials.authenticated
        };
    }

    private setCredentialsForGuest() {
        const { cognitoIdentityPoolId, cognitoRegion } = this._config;
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
    }
    
    private setCredentialsFromSession(session) {
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
    }
}