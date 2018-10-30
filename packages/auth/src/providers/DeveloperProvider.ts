import { AuthProvider } from '../types';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import BaseProvider from './BaseProvider';

const logger = new Logger('DeveloperProvider');

export default class DeveloperProvider extends BaseProvider implements AuthProvider {
    static NAME = 'Developer';
    static DEFAULT_DOMAIN = 'cognito-identity.amazonaws.com';

    constructor(options?) {
        super(options);
        this._credentialsDomain = DeveloperProvider.DEFAULT_DOMAIN;
    }

    public configure(options) {
        super.configure(options);
        const { refreshHandlers = {} } = this._config;

        this._refreshHandler = 
            refreshHandlers['developer'] || 
            refreshHandlers[this.getProviderName()];
    }

    public getProviderName() {
        return DeveloperProvider.NAME;
    }
}
