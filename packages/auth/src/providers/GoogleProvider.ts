import { AuthProvider } from '../types';
import { ConsoleLogger as Logger, GoogleOAuth } from '@aws-amplify/core';
import BaseProvider from './BaseProvider';

const logger = new Logger('GoogleProvider');

export default class GoogleProvider extends BaseProvider implements AuthProvider {
    static NAME = 'Google';
    static DEFAULT_DOMAIN = 'accounts.google.com';
    
    constructor(options?) {
        super(options);
        this._credentialsDomain = GoogleProvider.DEFAULT_DOMAIN;
    }

    public configure(options) {
        super.configure(options);
        const { refreshHandlers = {}, googleClientId } = this._config;
        
        this._refreshHandler = 
            refreshHandlers['google'] || 
            refreshHandlers[this.getProviderName()] || 
            GoogleOAuth.refreshGoogleToken;
    }

    public getProviderName() {
        return GoogleProvider.NAME;
    } 
}
