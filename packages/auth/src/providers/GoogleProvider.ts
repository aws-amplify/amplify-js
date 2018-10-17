import { AuthProvider } from '../types';
import { ConsoleLogger as Logger, GoogleOAuth } from '@aws-amplify/core';
import BaseProvider from './BaseProvider';

const logger = new Logger('GoogleProvider');

export default class GoogleProvider extends BaseProvider implements AuthProvider {
    constructor(options?) {
        super(options);
        this._credentialsDomain = 'accounts.google.com';
    }

    public configure(options) {
        super.configure(options);
        const { refreshHandlers = {} } = this._config;

        this._refreshHandler = 
            refreshHandlers['google'] || 
            refreshHandlers[this.getProviderName()] || 
            GoogleOAuth.refreshGoogleToken;
    }

    public getProviderName() {
        return 'Google';
    } 
}
