import { AuthProvider, ExternalSession, SetSessionResult, FederatedProviderSession, FederatedUser } from '../types';
import { Credentials, ConsoleLogger as Logger, FacebookOAuth } from '@aws-amplify/core';
import BaseProvider from './BaseProvider';

const logger = new Logger('FacebookProvider');

export default class FacebookProvider extends BaseProvider implements AuthProvider {
    static NAME = 'Facebook';
    static DEFAULT_DOMAIN = 'graph.facebook.com';

    constructor(options?) {
        super(options);
        this._credentialsDomain = FacebookProvider.DEFAULT_DOMAIN;
        this._credentialsTokenSource = BaseProvider.ACCESS_TOKEN;
    }

    public configure(options) {
        super.configure(options);
        const { refreshHandlers = {} } = this._config;

        this._refreshHandler = 
            this._refreshHandler || 
            refreshHandlers['facebook'] || 
            FacebookOAuth.refreshFacebookToken;
    }

    public getProviderName() {
        return FacebookProvider.NAME;
    } 
}
