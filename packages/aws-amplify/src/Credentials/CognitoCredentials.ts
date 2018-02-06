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
    private credentials = null;
    private credentials_source = ''; // aws, guest, userPool, federated

    constructor() {

    }

    configure(config) {

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

    getCredentials() {
        return {};
    }

    removeCredentials() {
        this.credentials.clearCachedId();
    }

    refreshCredentials(credentials): Promise<any> {
        const cred = credentials || this.credentials;
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
                    resolve(credentials);
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

    public currentCredentials(): Promise<any> {
        if (this.credentials && !this.isExpired(this.credentials)) {
            return this.refreshCredentials(this.credentials);
        }
        else{
            const that = this;
            return this.retrieveCredentialsFromAuth()
                .then(() => {
                    const credentials = that.credentials;
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

    private setCredentialsFromAWS() {
        if (AWS.config && AWS.config.credentials) {
            this.credentials = AWS.config.credentials;
            this.credentials_source = 'aws';
            return true;
        }
        return false;
    }

    private setCredentialsForGuest() {
        const { identityPoolId, region } = this._config;
        const credentials = new CognitoIdentityCredentials(
            {
            IdentityPoolId: identityPoolId
        },  {
            region
        });
        credentials.params['IdentityId'] = null; // Cognito load IdentityId from local cache
        this.credentials = credentials;
        this.credentials.authenticated = false;
        this.credentials_source = 'guest';
    }
    
    private setCredentialsFromSession(session) {
        logger.debug('set credentials from session');
        const idToken = session.getIdToken().getJwtToken();
        const { region, userPoolId, identityPoolId } = this._config;
        const key = 'cognito-idp.' + region + '.amazonaws.com/' + userPoolId;
        const logins = {};
        logins[key] = idToken;
        this.credentials = new CognitoIdentityCredentials(
            {
            IdentityPoolId: identityPoolId,
            Logins: logins
        },  {
            region
        });
        this.credentials.authenticated = true;
        this.credentials_source = 'userPool';
    }
}